import logging
from enum import StrEnum
from pathlib import Path
from typing import Annotated

from pydantic import AfterValidator, HttpUrl, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


def is_not_empty(value: str) -> str:
    if value == "":
        raise ValueError("Value cannot be empty")
    return value


class EnvironmentType(StrEnum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "myapp"
    JWT_SECRET_KEY: Annotated[str, AfterValidator(is_not_empty)] = ""


    templates_path: Path = Path(__file__).parent.parent / "templates"
    assets_path: Path = Path(__file__).parent.parent / "assets"

    environment: EnvironmentType = EnvironmentType.PRODUCTION
    release: str = "default"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )


config = Config()
