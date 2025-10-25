import logging
from typing import Any, AsyncContextManager, Callable, Mapping, Self

import fastapi
from fastapi import Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.errors import UserFacingError, ValidationError
from app.repositories.base import ConstraintViolationError, NotFoundError, NotUniqueError
from app.api.tasks import tasks_router
logger = logging.getLogger(__name__)


def handle_exceptions(request: Request, e: Exception) -> JSONResponse:
    if isinstance(e, NotFoundError):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": e.message})
    elif isinstance(e, NotUniqueError):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": e.message})
    elif isinstance(e, ConstraintViolationError):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(e)})
    elif isinstance(e, ValidationError):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(e)})
    elif isinstance(e, UserFacingError):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(e)})

    logger.exception(e)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": str(e)})


class App(fastapi.FastAPI):
    def __init__(  # type: ignore[explicit-any]
        self,
        lifespan: Callable[[Self], AsyncContextManager[Mapping[str, Any]]] | None = None,
    ) -> None:
        super().__init__(title="MyApp API", lifespan=lifespan)
        self.add_middleware(
            CORSMiddleware,
            # allow_origins=config.allowed_origins.split(",") if config.has_auth else ["*"],
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.include_router(tasks_router)

        # # Handle 500s separately to play well with TestClient and allow re-raising in tests
        self.add_exception_handler(NotFoundError, handle_exceptions)
        self.add_exception_handler(NotUniqueError, handle_exceptions)
        self.add_exception_handler(ConstraintViolationError, handle_exceptions)
        self.add_exception_handler(ValidationError, handle_exceptions)
        self.add_exception_handler(UserFacingError, handle_exceptions)
        self.add_exception_handler(Exception, handle_exceptions)
