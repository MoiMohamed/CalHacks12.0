import logging
from typing import cast
from urllib.parse import urlparse

import sentry_sdk
from sentry_sdk.types import Event, Hint

from app.config import config


def filter_transactions(event: Event, hint: Hint) -> Event | None:
    if "request" not in event:
        return event
    url_string = cast(str, event["request"]["url"])
    parsed_url = urlparse(url_string)

    if parsed_url.path == "/healthcheck":
        return None

    return event


logger = logging.getLogger(__name__)


def setup_sentry() -> None:
    if config.SENTRY_DSN is None:
        return

    sentry_sdk.init(
        dsn=str(config.SENTRY_DSN),
        send_default_pii=True,
        environment=config.environment,
        release=config.release,
        enable_tracing=True,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.05,
        ignore_errors=[KeyboardInterrupt],
        before_send_transaction=filter_transactions,
    )
