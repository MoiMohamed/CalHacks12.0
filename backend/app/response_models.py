from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    data: T | None = None


class SuccessListResponse(BaseModel, Generic[T]):
    data: list[T] | Sequence[T] | None = None
    meta: dict[str, int | str | bool] | None = None
