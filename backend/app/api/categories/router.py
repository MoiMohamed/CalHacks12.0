from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import CategoryCreate, CategoryRead, CategoryUpdate
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse, SuccessListResponse
from app.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=SuccessResponse[CategoryRead])
async def create_category(
    category_data: CategoryCreate,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> SuccessResponse[CategoryRead]:
    """Create a new category"""
    category = await category_service.create_category(session, category_data)
    return SuccessResponse(data=category)


@router.get("/user/{user_id}", response_model=SuccessListResponse[CategoryRead])
async def list_user_categories(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> SuccessListResponse[CategoryRead]:
    """List categories for a user"""
    categories = await category_service.list_user_categories(session, user_id)
    return SuccessListResponse(data=categories)


@router.get("/{category_id}", response_model=SuccessResponse[CategoryRead])
async def get_category(
    category_id: UUID,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> SuccessResponse[CategoryRead]:
    """Get category by ID"""
    category = await category_service.get_category(session, category_id)
    return SuccessResponse(data=category)


@router.put("/{category_id}", response_model=SuccessResponse[CategoryRead])
async def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> SuccessResponse[CategoryRead]:
    """Update category"""
    category = await category_service.update_category(session, category_id, category_data)
    return SuccessResponse(data=category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: UUID,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> None:
    """Delete category"""
    await category_service.delete_category(session, category_id)


@router.post("/get-or-create", response_model=SuccessResponse[CategoryRead])
async def get_or_create_category(
    user_id: UUID,
    category_name: str,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(),
) -> SuccessResponse[CategoryRead]:
    """Get an existing category or create a new one for the user"""
    category = await category_service.get_or_create_category(session, user_id, category_name)
    return SuccessResponse(data=category)
