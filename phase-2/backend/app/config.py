import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql+asyncpg://localhost/todos"

    # JWT Authentication
    jwt_secret: str = "change-me-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Frontend URL for JWKS verification
    frontend_url: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
