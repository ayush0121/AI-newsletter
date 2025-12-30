from jose import jwt, JWTError
from app.core.config import settings

ALGORITHM = "HS256"

def verify_token(token: str) -> dict | None:
    """
    Verifies the Supabase JWT signature.
    Returns the decoded payload if valid, else None.
    """
    try:
        if not settings.SUPABASE_JWT_SECRET:
            # If secret is missing, we cannot verify. Log error?
            # For strictness, auth fails.
            return None
            
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated" # Supabase tokens usually have aud="authenticated"
        )
        return payload
    except JWTError:
        return None
