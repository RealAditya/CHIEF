import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "CHIEF"
    environment: str = "development"
    log_level: str = "INFO"
    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_user: str = "chief"
    postgres_password: str = "chief"
    postgres_db: str = "chief"
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0
    enable_connectivity_checks: bool = True

    @classmethod
    def load(cls) -> "Settings":
        return cls(
            app_name=os.getenv("APP_NAME", "CHIEF"),
            environment=os.getenv("APP_ENVIRONMENT", "development"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            postgres_host=os.getenv("POSTGRES_HOST", "postgres"),
            postgres_port=int(os.getenv("POSTGRES_PORT", "5432")),
            postgres_user=os.getenv("POSTGRES_USER", "chief"),
            postgres_password=os.getenv("POSTGRES_PASSWORD", "chief"),
            postgres_db=os.getenv("POSTGRES_DB", "chief"),
            redis_host=os.getenv("REDIS_HOST", "redis"),
            redis_port=int(os.getenv("REDIS_PORT", "6379")),
            redis_db=int(os.getenv("REDIS_DB", "0")),
            enable_connectivity_checks=os.getenv("ENABLE_CONNECTIVITY_CHECKS", "true").lower()
            in {"1", "true", "yes", "on"},
        )


def get_settings() -> Settings:
    return Settings.load()
