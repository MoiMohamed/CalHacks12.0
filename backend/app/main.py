import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator, Awaitable, Callable

from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import FileResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import Connection

# from fastapi.templating import Jinja2Templates

from app.config import config
from app.fastapi_app import App
from app.response_models import SuccessResponse
from app.repositories.base import engine
from app.sentry import setup_sentry


logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

setup_sentry()


def run_upgrade(connection: Connection, cfg: Config) -> None:
    cfg.attributes["connection"] = connection
    command.upgrade(cfg, "head")


async def run_migrations() -> None:
    path = Path(__file__).parent.parent / "alembic.ini"
    alembic_cfg = Config(path)
    loc = alembic_cfg.get_main_option("script_location")
    if not loc:
        raise Exception("Something went wrong - alembic config is None")
    logger.info(f"Running migrations from '{loc}'")
    alembic_cfg.set_main_option("script_location", str(loc))
    alembic_cfg.config_file_name = None  # to prevent alembic from overriding the logs
    async with engine.begin() as conn:
        await conn.run_sync(run_upgrade, alembic_cfg)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # On startup
    # await init_sentry()
    # TODO: put this in the docker image, if we run multiple workers this will unncessarily run migrations many times
    if config.environment == "development":
        await run_migrations()
    yield


app = App(lifespan=lifespan)  # type: ignore
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=6)


@app.middleware("http")
async def delete_auth_cookie_on_exception(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    response = await call_next(request)
    if response.status_code == status.HTTP_401_UNAUTHORIZED:
        response.delete_cookie(key="Authorization", secure=True, httponly=True)
    return response


@app.get("/healthcheck", response_model_exclude_none=True)
async def healthcheck() -> SuccessResponse[None]:
    return SuccessResponse()

# templates = Jinja2Templates(directory=config.templates_path)
app.mount("/assets", StaticFiles(directory=config.assets_path), name="static")

if config.environment == "production":

    @app.get("/{rest_of_path:path}", include_in_schema=False)
    def index(request: Request, rest_of_path: str) -> FileResponse:
        # Return the index.html file from the assets folder
        return FileResponse(config.assets_path / "index.html")


# if __name__ == "__main__":
#     # You must pass the application as an import string to enable 'reload' or 'workers'.
#     # uvicorn.run("aralects.main:app", host="0.0.0.0", port=8000, reload=True)
#     uvicorn.run("aralects.main:app", host="0.0.0.0", port=8000, reload=True, workers=2)
#     # uvicorn.run("aralects.main:app", host="0.0.0.0", port=8000, workers=2)
#     # uvicorn.run(app, host="0.0.0.0", port=8000)
