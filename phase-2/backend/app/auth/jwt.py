from typing import Optional
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from pydantic import BaseModel
import time

from app.config import get_settings

settings = get_settings()
security = HTTPBearer()

# Cache for PyJWKClient
_jwk_client = None


def get_jwk_client() -> PyJWKClient:
    """Get or create the PyJWKClient for JWKS verification."""
    global _jwk_client
    if _jwk_client is None:
        _jwk_client = PyJWKClient(
            f"{settings.frontend_url}/api/auth/jwks",
            cache_keys=True,
            lifespan=3600  # 1 hour cache
        )
    return _jwk_client


class TokenPayload(BaseModel):
    """JWT token payload structure."""
    sub: str  # User ID
    email: Optional[str] = None
    name: Optional[str] = None


class CurrentUser(BaseModel):
    """Current authenticated user info."""
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """
    Dependency to extract and verify JWT token using JWKS.
    Returns the current user info from the token payload.
    """
    token = credentials.credentials

    try:
        # Get the signing key from JWKS
        jwk_client = get_jwk_client()
        signing_key = jwk_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "ES256", "RS256"],
            audience=settings.frontend_url,
            issuer=settings.frontend_url,
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return CurrentUser(
            user_id=user_id,
            email=payload.get("email"),
            name=payload.get("name")
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
