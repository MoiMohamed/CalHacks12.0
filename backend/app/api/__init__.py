from .tasks import router as tasks_router
from .users import users_router
from .categories import categories_router
from .routines import routines_router
from .missions import missions_router
from .rewards import rewards_router

__all__ = [
    "tasks_router",
    "users_router", 
    "categories_router",
    "routines_router",
    "missions_router",
    "rewards_router",
]
