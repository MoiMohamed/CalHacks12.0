from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import RoutineCreate, RoutineRead, RoutineUpdate, RoutineCreateWithSchedule, RoutineTaskGenerationResponse
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse, SuccessListResponse
from app.services.routine import RoutineService
from app.models.neuri.request import GenerateRoutineTasksRequest, CreateRoutineRequest

router = APIRouter(prefix="/routines", tags=["Routines"])


@router.post("/", response_model=SuccessResponse[RoutineRead])
async def create_routine(
    request: CreateRoutineRequest,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineRead]:
    """Create a new routine - Vapi apiRequest compatible"""
    from uuid import UUID
    HARDCODED_USER_ID = "ac22a45c-fb5b-4027-9e41-36d6b9abaebb"
    routine_data = RoutineCreate(
        title=request.title,
        user_id=UUID(HARDCODED_USER_ID),
        category_id=UUID(request.category_id) if request.category_id else None,
        schedule=request.schedule
    )
    routine = await routine_service.create_routine(session, routine_data)
    return SuccessResponse(data=routine)


@router.post("/legacy", response_model=SuccessResponse[RoutineRead])
async def create_routine_legacy(
    routine_data: RoutineCreate,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineRead]:
    """Create a new routine (legacy endpoint)"""
    routine = await routine_service.create_routine(session, routine_data)
    return SuccessResponse(data=routine)


@router.post("/with-schedule", response_model=SuccessResponse[RoutineRead])
async def create_routine_with_schedule(
    routine_data: RoutineCreateWithSchedule,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineRead]:
    """Create a routine with schedule"""
    routine = await routine_service.create_routine_with_schedule(session, routine_data)
    return SuccessResponse(data=routine)


@router.get("/user/{user_id}", response_model=SuccessListResponse[RoutineRead])
async def list_user_routines(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessListResponse[RoutineRead]:
    """List routines for a user"""
    routines = await routine_service.list_user_routines(session, user_id)
    return SuccessListResponse(data=routines)


@router.get("/user/{user_id}/category/{category_id}", response_model=SuccessListResponse[RoutineRead])
async def list_category_routines(
    user_id: UUID,
    category_id: UUID,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessListResponse[RoutineRead]:
    """List routines in a category"""
    routines = await routine_service.list_category_routines(session, user_id, category_id)
    return SuccessListResponse(data=routines)


@router.get("/user/{user_id}/day/{day_of_week}", response_model=SuccessListResponse[RoutineRead])
async def get_routines_for_day(
    user_id: UUID,
    day_of_week: str,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessListResponse[RoutineRead]:
    """Get routines scheduled for a specific day of the week"""
    routines = await routine_service.get_routines_for_day(session, user_id, day_of_week)
    return SuccessListResponse(data=routines)


@router.get("/{routine_id}", response_model=SuccessResponse[RoutineRead])
async def get_routine(
    routine_id: UUID,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineRead]:
    """Get routine by ID"""
    routine = await routine_service.get_routine(session, routine_id)
    return SuccessResponse(data=routine)


@router.put("/{routine_id}", response_model=SuccessResponse[RoutineRead])
async def update_routine(
    routine_id: UUID,
    routine_data: RoutineUpdate,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineRead]:
    """Update routine"""
    routine = await routine_service.update_routine(session, routine_id, routine_data)
    return SuccessResponse(data=routine)


@router.post("/{routine_id}/generate-tasks", response_model=SuccessResponse[RoutineTaskGenerationResponse])
async def generate_routine_tasks(
    routine_id: UUID,
    days: int,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineTaskGenerationResponse]:
    """Generate tasks for a routine over N days"""
    result = await routine_service.generate_tasks_for_days(session, routine_id, days)
    return SuccessResponse(data=result)


@router.post("/generate-tasks", response_model=SuccessResponse[RoutineTaskGenerationResponse])
async def generate_routine_tasks_body(
    request: GenerateRoutineTasksRequest,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> SuccessResponse[RoutineTaskGenerationResponse]:
    """Generate tasks for a routine - Vapi apiRequest compatible"""
    routine_id = UUID(request.routine_id)
    result = await routine_service.generate_tasks_for_days(session, routine_id, request.days)
    return SuccessResponse(data=result)


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_routine(
    routine_id: UUID,
    session: AsyncSession = Depends(get_session),
    routine_service: RoutineService = Depends(),
) -> None:
    """Delete routine"""
    await routine_service.delete_routine(session, routine_id)
