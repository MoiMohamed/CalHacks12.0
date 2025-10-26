import logging
from datetime import datetime
from typing import Annotated
from typing_extensions import TypedDict
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.neuri.model import MissionType

logger = logging.getLogger(__name__)


# Schedule Schemas
class ScheduleItem(TypedDict):
    day: str
    time: str


# User Schemas
class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    name: str | None = Field(None, max_length=255)
    pace: str | None = Field(None, max_length=50)  # "relaxed", "focused"
    preferred_work_time: str | None = Field(None, max_length=50)  # "evening", "morning"


class UserCreate(UserBase): ...


class UserUpdate(BaseModel):
    email: str | None = Field(None, max_length=255)
    name: str | None = Field(None, max_length=255)
    pace: str | None = Field(None, max_length=50)
    preferred_work_time: str | None = Field(None, max_length=50)
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class UserProfileSetup(BaseModel):
    """Schema for initial user profile setup during onboarding"""

    name: str = Field(..., max_length=255)
    pace: str = Field(..., max_length=50)  # "relaxed", "focused"
    preferred_work_time: str = Field(..., max_length=50)  # "evening", "morning"


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=255)
    user_id: UUID


class CategoryCreate(CategoryBase): ...


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


# Routine Schemas
class RoutineBase(BaseModel):
    user_id: UUID
    category_id: UUID | None = None
    title: str = Field(..., max_length=255)
    schedule: str | None = None  # JSON string


class RoutineCreate(RoutineBase): ...


class RoutineUpdate(BaseModel):
    category_id: UUID | None = None
    title: str | None = Field(None, max_length=255)
    schedule: str | None = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class RoutineRead(RoutineBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class RoutineCreateWithSchedule(BaseModel):
    """Schema for creating routine with schedule list"""

    user_id: UUID
    category_id: UUID | None = None
    title: str = Field(..., max_length=255)
    schedule: list[ScheduleItem] | None = None


# Mission Schemas
class MissionBase(BaseModel):
    title: str = Field(..., max_length=255)
    type: MissionType
    user_id: UUID
    category_id: UUID | None = None
    parent_project_id: UUID | None = Field(None, alias="parentProjectId")
    parent_routine_id: UUID | None = Field(None, alias="parentRoutineId")
    body: str | None = None
    true_deadline: datetime | None = None
    personal_deadline: datetime | None = None
    recurrence_rule: str | None = Field(None, max_length=100)
    is_complete: bool = False
    heaviness: int | None = Field(None, ge=1, le=10)
    priority: int | None = Field(None, ge=1, le=10)

    model_config = ConfigDict(populate_by_name=True)


class MissionCreate(MissionBase): ...


class MissionUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    type: MissionType | None = None
    category_id: UUID | None = None
    parent_project_id: UUID | None = None
    parent_routine_id: UUID | None = None
    body: str | None = None
    true_deadline: datetime | None = None
    personal_deadline: datetime | None = None
    recurrence_rule: str | None = Field(None, max_length=100)
    is_complete: bool | None = None
    heaviness: int | None = Field(None, ge=1, le=10)
    priority: int | None = Field(None, ge=1, le=10)
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class MissionRead(MissionBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class MissionWithRelationsRead(MissionRead):
    """Mission with related entities"""

    category: CategoryRead | None = None
    parent_project: MissionRead | None = None
    parent_routine: RoutineRead | None = None
    sub_tasks: list[MissionRead] = []


# Reward Schemas
class RewardBase(BaseModel):
    user_id: UUID
    points: int = 0
    streak: int = 0
    total_tasks_done: int = 0
    milestones_unlocked: str | None = None


class RewardCreate(RewardBase): ...


class RewardUpdate(BaseModel):
    points: int | None = None
    streak: int | None = None
    total_tasks_done: int | None = None
    milestones_unlocked: str | None = None
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class RewardRead(RewardBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    """Dashboard statistics for user"""

    total_points: int
    current_streak: int
    total_tasks_done: int
    milestones_unlocked: str | None


# Dashboard/Summary Schemas
class UserDashboardRead(BaseModel):
    """User dashboard with summary data"""

    user: UserRead
    reward: RewardRead
    total_missions: int
    completed_missions: int
    pending_missions: int
    total_categories: int
    total_routines: int
    current_streak: int


class MissionStatsRead(BaseModel):
    """Mission statistics"""

    total: int
    completed: int
    pending: int
    by_type: dict[str, int]
    by_category: dict[str, int]


class RoutineScheduleRead(BaseModel):
    """Routine schedule with parsed schedule data"""

    routine: RoutineRead
    schedule_items: list[ScheduleItem]


class RoutineTaskGeneration(BaseModel):
    """Schema for generating tasks from a routine over N days"""

    routine_id: UUID
    days: int = Field(..., ge=1, le=365)  # Between 1 and 365 days


class GeneratedTask(BaseModel):
    """A task generated from a routine"""

    title: str
    scheduled_date: datetime
    day_number: int
    day_of_week: str


class RoutineTaskGenerationResponse(BaseModel):
    """Response for routine task generation"""

    routine: RoutineRead
    days_requested: int
    generated_tasks: list[GeneratedTask]
    total_tasks: int


# Export Schemas
class ExportMission(TypedDict):
    id: str
    title: str
    type: str
    category: str | None
    body: str | None
    deadline: str | None
    is_complete: bool
    heaviness: int | None
    priority: int | None
    created_at: str
    updated_at: str


class ExportUser(TypedDict):
    id: str
    email: str
    name: str | None
    pace: str | None
    preferred_work_time: str | None
    missions: list[ExportMission]
    categories: list[str]
    routines: list[str]
    reward_stats: dict
