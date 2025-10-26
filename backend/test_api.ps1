# PowerShell script to test the parent_project_id bug
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Testing parent_project_id Bug via HTTP API" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Function to make API calls
function Invoke-ApiCall {
    param (
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $url = "$baseUrl$Endpoint"
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "Request Body:" -ForegroundColor DarkGray
            Write-Host $jsonBody -ForegroundColor DarkGray
            Write-Host ""
            
            $response = Invoke-RestMethod -Uri $url -Method $Method -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method
        }
        
        return $response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        return $null
    }
}

# Test if server is running
Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/healthcheck" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "Please start the server first by running: .\start_server.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 1: Create a test user
Write-Host "2. Creating test user..." -ForegroundColor Yellow
$userEmail = "test_$(New-Guid)@test.com"
$userData = @{
    email = $userEmail
    name = "Test User"
}

$user = Invoke-ApiCall -Method POST -Endpoint "/users" -Body $userData
if ($user) {
    $userId = $user.data.id
    Write-Host "✅ User created with ID: $userId" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Failed to create user" -ForegroundColor Red
    exit 1
}

# Step 2: Create a project
Write-Host "3. Creating a PROJECT..." -ForegroundColor Yellow
$projectData = @{
    title = "Write My Thesis"
    type = "project"
    user_id = $userId
}

Write-Host "Sending:" -ForegroundColor DarkGray
$projectData | ConvertTo-Json | Write-Host -ForegroundColor DarkGray
Write-Host ""

$project = Invoke-ApiCall -Method POST -Endpoint "/missions" -Body $projectData
if ($project) {
    $projectId = $project.data.id
    Write-Host "✅ Project created with ID: $projectId" -ForegroundColor Green
    Write-Host "   parent_project_id: $($project.data.parent_project_id)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Failed to create project" -ForegroundColor Red
    exit 1
}

# Step 3: Create a sub-task WITH parent_project_id
Write-Host "4. Creating a SUB-TASK with parent_project_id..." -ForegroundColor Yellow
$subtaskData = @{
    title = "Study Physics"
    type = "task"
    user_id = $userId
    parent_project_id = $projectId  # ← THIS IS THE KEY!
}

Write-Host "Sending (NOTE the parent_project_id):" -ForegroundColor DarkGray
$subtaskData | ConvertTo-Json | Write-Host -ForegroundColor DarkGray
Write-Host ""

$subtask = Invoke-ApiCall -Method POST -Endpoint "/missions" -Body $subtaskData
if ($subtask) {
    Write-Host "Response received:" -ForegroundColor DarkGray
    $subtask.data | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    Write-Host ""
    
    # Check the result
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "RESULTS:" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    
    Write-Host "Expected parent_project_id: $projectId" -ForegroundColor White
    Write-Host "Actual parent_project_id:   $($subtask.data.parent_project_id)" -ForegroundColor White
    Write-Host ""
    
    if ($subtask.data.parent_project_id -eq $projectId) {
        Write-Host "✅ SUCCESS: parent_project_id is correctly set!" -ForegroundColor Green
    } elseif ($null -eq $subtask.data.parent_project_id) {
        Write-Host "❌ BUG CONFIRMED: parent_project_id is NULL!" -ForegroundColor Red
        Write-Host "   The backend is ignoring the parent_project_id parameter!" -ForegroundColor Red
    } else {
        Write-Host "❌ BUG: parent_project_id has wrong value!" -ForegroundColor Red
        Write-Host "   Expected: $projectId" -ForegroundColor Red
        Write-Host "   Got:      $($subtask.data.parent_project_id)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "Full Sub-task Response:" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "ID:                 $($subtask.data.id)" -ForegroundColor White
    Write-Host "Title:              $($subtask.data.title)" -ForegroundColor White
    Write-Host "Type:               $($subtask.data.type)" -ForegroundColor White
    Write-Host "User ID:            $($subtask.data.user_id)" -ForegroundColor White
    Write-Host "parent_project_id:  $($subtask.data.parent_project_id)" -ForegroundColor Yellow
    Write-Host "Created at:         $($subtask.data.created_at)" -ForegroundColor White
    Write-Host "================================================================================" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Failed to create subtask" -ForegroundColor Red
    exit 1
}

