from pydantic import BaseModel
from app.models.neuri.schema import MissionUpdate


class CompleteMissionRequest(BaseModel):
    mission_id: str


class BreakDownMissionRequest(BaseModel):
    mission_id: str
    subtask_titles: list[str]


class UpdateMissionRequest(MissionUpdate):
    mission_id: str


class GenerateRoutineTasksRequest(BaseModel):
    routine_id: str
    days: int


class GetOrCreateCategoryRequest(BaseModel):
    user_id: str
    category_name: str


class UpdateUserStreakRequest(BaseModel):
    streak_change: int


class AddMissionPointsRequest(BaseModel):
    mission_type: str
    is_subtask: bool = False


class UpdateUserRequest(BaseModel):
    name: str | None = None
    pace: str | None = None
    preferred_work_time: str | None = None


class CreateRoutineRequest(BaseModel):
    title: str
    category_id: str | None = None
    schedule: str | None = None


class CreateCategoryRequest(BaseModel):
    name: str
