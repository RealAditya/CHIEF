from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from backend.app.api.health import router as health_router
from backend.app.api.modules import router as modules_router
from backend.app.api.events import router as events_router
from backend.app.core.config import get_settings
from backend.app.core.logging import get_logger
from backend.app.core.module_loader import loader as module_loader

try:
    from psycopg import connect as psycopg_connect
    from redis import Redis
except ImportError:  # pragma: no cover - dependency availability in minimal environments
    psycopg_connect = None
    Redis = None

settings = get_settings()
logger = get_logger("chief.backend")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("startup")

    # Discover modules on startup. The loader logs each discovered module.
    try:
        module_loader.discover()
    except Exception:
        logger.exception("Module discovery failed")

    if settings.enable_connectivity_checks:
        if psycopg_connect is not None:
            try:
                with psycopg_connect(
                    host=settings.postgres_host,
                    port=settings.postgres_port,
                    user=settings.postgres_user,
                    password=settings.postgres_password,
                    dbname=settings.postgres_db,
                ) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
                    logger.info("successful database connection")
            except Exception as exc:  # pragma: no cover - startup validation
                logger.exception("database connection failed: %s", exc)

        if Redis is not None:
            try:
                redis_client = Redis(host=settings.redis_host, port=settings.redis_port, db=settings.redis_db)
                redis_client.ping()
                logger.info("successful Redis connection")
            except Exception as exc:  # pragma: no cover - startup validation
                logger.exception("Redis connection failed: %s", exc)

    yield

    logger.info("shutdown")


app = FastAPI(title="CHIEF", version="0.1.0", lifespan=lifespan)
app.include_router(health_router)
app.include_router(modules_router)
app.include_router(events_router)
