from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import RewardRead, DashboardStats
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse
from app.services.reward import RewardService
from app.models.neuri.request import UpdateUserStreakRequest, AddMissionPointsRequest

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/user/{user_id}", response_model=SuccessResponse[RewardRead])
async def get_user_reward(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Get user's reward profile"""
    reward = await reward_service.get_user_reward(session, user_id)
    return SuccessResponse(data=reward)


@router.post("/user/{user_id}/add-mission-points", response_model=SuccessResponse[RewardRead])
async def add_mission_points(
    user_id: UUID,
    mission_type: str,
    is_subtask: bool = False,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Add points for completing a mission"""
    reward = await reward_service.add_mission_points(session, user_id, mission_type, is_subtask)
    return SuccessResponse(data=reward)


@router.patch("/user/{user_id}/update-streak", response_model=SuccessResponse[RewardRead])
async def update_user_streak(
    user_id: UUID,
    streak_change: int,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Update user's streak"""
    reward = await reward_service.update_user_streak(session, user_id, streak_change)
    return SuccessResponse(data=reward)


@router.get("/user/{user_id}/dashboard-stats", response_model=SuccessResponse[DashboardStats])
async def get_dashboard_stats(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[DashboardStats]:
    """Get dashboard statistics"""
    stats = await reward_service.get_dashboard_stats(session, user_id)
    return SuccessResponse(data=stats)


# New endpoints for Vapi apiRequest tools (accept parameters in body)
# Hardcoded user_id for now since our tools have it in the URL
HARDCODED_USER_ID = "ac22a45c-fb5b-4027-9e41-36d6b9abaebb"

@router.patch("/update-streak", response_model=SuccessResponse[RewardRead])
async def update_user_streak_body(
    request: UpdateUserStreakRequest,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Update user's streak - Vapi apiRequest compatible"""
    user_uuid = UUID(HARDCODED_USER_ID)
    reward = await reward_service.update_user_streak(session, user_uuid, request.streak_change)
    return SuccessResponse(data=reward)


@router.post("/add-mission-points", response_model=SuccessResponse[RewardRead])
async def add_mission_points_body(
    request: AddMissionPointsRequest,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Add points for completing a mission - Vapi apiRequest compatible"""
    user_uuid = UUID(HARDCODED_USER_ID)
    reward = await reward_service.add_mission_points(session, user_uuid, request.mission_type, request.is_subtask)
    return SuccessResponse(data=reward)
