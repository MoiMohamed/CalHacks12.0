from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import MissionCreate, MissionRead, MissionUpdate, MissionWithRelationsRead
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse, SuccessListResponse
from app.services.mission import MissionService
from app.models.neuri.request import UpdateMissionRequest, CompleteMissionRequest, BreakDownMissionRequest

router = APIRouter(prefix="/missions", tags=["Missions"])


def convert_timezone_aware_to_naive(data: dict) -> dict:
    """Convert timezone-aware datetimes to naive UTC datetimes for database storage"""
    from datetime import timezone
    for key, value in data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            # Convert to UTC first, then make it naive
            data[key] = value.astimezone(timezone.utc).replace(tzinfo=None)
        elif isinstance(value, datetime) and value.tzinfo is None:
            # If already naive, assume it's UTC
            data[key] = value
    return data


@router.post("/", response_model=SuccessResponse[MissionRead])
async def create_mission(
    mission_data: MissionCreate,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Create a new mission"""
    # Convert timezone-aware datetimes to naive for database
    mission_dict = convert_timezone_aware_to_naive(mission_data.model_dump())
    mission_create = MissionCreate(**mission_dict)
    mission = await mission_service.create_mission(session, mission_create)
    return SuccessResponse(data=mission)


@router.get("/user/{user_id}", response_model=SuccessListResponse[MissionRead])
async def list_user_missions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """List missions for a user"""
    missions = await mission_service.list_user_missions(session, user_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/today", response_model=SuccessListResponse[MissionRead])
async def list_today_missions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Get missions due today - ADHD focus"""
    missions = await mission_service.list_today_missions(session, user_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/overdue", response_model=SuccessListResponse[MissionRead])
async def list_overdue_missions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Get overdue missions - ADHD urgency"""
    missions = await mission_service.list_overdue_missions(session, user_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/high-priority", response_model=SuccessListResponse[MissionRead])
async def list_high_priority_missions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Get high priority missions - ADHD focus"""
    missions = await mission_service.list_high_priority_missions(session, user_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/heavy", response_model=SuccessListResponse[MissionRead])
async def list_heavy_missions(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Get heavy missions that might need breaking down"""
    missions = await mission_service.list_heavy_missions(session, user_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/search", response_model=SuccessListResponse[MissionRead])
async def search_missions(
    user_id: UUID,
    search_term: str,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Search missions by title - ADHD context awareness"""
    missions = await mission_service.search_missions(session, user_id, search_term)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/category/{category_id}", response_model=SuccessListResponse[MissionRead])
async def list_category_missions(
    user_id: UUID,
    category_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """List missions in a category"""
    missions = await mission_service.list_category_missions(session, user_id, category_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/type/{mission_type}", response_model=SuccessListResponse[MissionRead])
async def list_type_missions(
    user_id: UUID,
    mission_type: str,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """List missions by type"""
    missions = await mission_service.list_type_missions(session, user_id, mission_type)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/subtasks/{parent_project_id}", response_model=SuccessListResponse[MissionRead])
async def list_sub_tasks(
    user_id: UUID,
    parent_project_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """List sub-tasks for a project"""
    missions = await mission_service.list_sub_tasks(session, user_id, parent_project_id)
    return SuccessListResponse(data=missions)


@router.get("/user/{user_id}/routine/{routine_id}", response_model=SuccessListResponse[MissionRead])
async def list_routine_generated_missions(
    user_id: UUID,
    routine_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """List missions generated by a routine"""
    missions = await mission_service.list_routine_generated_missions(session, user_id, routine_id)
    return SuccessListResponse(data=missions)


@router.get("/{mission_id}", response_model=SuccessResponse[MissionRead])
async def get_mission(
    mission_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Get mission by ID"""
    mission = await mission_service.get_mission(session, mission_id)
    return SuccessResponse(data=mission)


@router.get("/{mission_id}/with-relations", response_model=SuccessResponse[MissionWithRelationsRead])
async def get_mission_with_relations(
    mission_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionWithRelationsRead]:
    """Get mission with all relations"""
    mission = await mission_service.get_mission_with_relations(session, mission_id)
    return SuccessResponse(data=mission)


@router.put("/{mission_id}", response_model=SuccessResponse[MissionRead])
async def update_mission(
    mission_id: UUID,
    mission_data: MissionUpdate,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Update mission"""
    mission = await mission_service.update_mission(session, mission_id, mission_data)
    return SuccessResponse(data=mission)


@router.patch("/{mission_id}/complete", response_model=SuccessResponse[MissionRead])
async def complete_mission(
    mission_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Mark mission as complete and update rewards"""
    mission = await mission_service.complete_mission(session, mission_id)
    return SuccessResponse(data=mission)


@router.post("/{mission_id}/break-down", response_model=SuccessListResponse[MissionRead])
async def break_down_mission(
    mission_id: UUID,
    subtask_titles: list[str],
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Break down a heavy mission into smaller subtasks"""
    subtasks = await mission_service.break_down_mission(session, mission_id, subtask_titles)
    return SuccessListResponse(data=subtasks)


@router.get("/user/{user_id}/ai-context", response_model=SuccessResponse[dict])
async def get_context_for_ai(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[dict]:
    """Get context for AI agent - recent missions, overdue, etc."""
    context = await mission_service.get_context_for_ai(session, user_id)
    return SuccessResponse(data=context)


@router.delete("/{mission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mission(
    mission_id: UUID,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> None:
    """Delete mission"""
    await mission_service.delete_mission(session, mission_id)


# New endpoints for Vapi apiRequest tools (accept mission_id in body)
@router.put("/", response_model=SuccessResponse[MissionRead])
async def update_mission_body(
    request: UpdateMissionRequest,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Update mission - Vapi apiRequest compatible"""
    mission_id = UUID(request.mission_id)
    # Create MissionUpdate without mission_id, excluding unset fields (None values)
    update_dict = {k: v for k, v in request.model_dump(exclude={'mission_id'}).items() if v is not None}
    
    # Convert timezone-aware datetimes to naive datetimes
    update_dict = convert_timezone_aware_to_naive(update_dict)
    
    update_data = MissionUpdate(**update_dict)
    mission = await mission_service.update_mission(session, mission_id, update_data)
    return SuccessResponse(data=mission)


@router.patch("/complete", response_model=SuccessResponse[MissionRead])
async def complete_mission_body(
    request: CompleteMissionRequest,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessResponse[MissionRead]:
    """Mark mission as complete - Vapi apiRequest compatible"""
    mission_id = UUID(request.mission_id)
    mission = await mission_service.complete_mission(session, mission_id)
    return SuccessResponse(data=mission)


@router.post("/break-down", response_model=SuccessListResponse[MissionRead])
async def break_down_mission_body(
    request: BreakDownMissionRequest,
    session: AsyncSession = Depends(get_session),
    mission_service: MissionService = Depends(),
) -> SuccessListResponse[MissionRead]:
    """Break down a heavy mission - Vapi apiRequest compatible"""
    mission_id = UUID(request.mission_id)
    subtasks = await mission_service.break_down_mission(session, mission_id, request.subtask_titles)
    return SuccessListResponse(data=subtasks)
