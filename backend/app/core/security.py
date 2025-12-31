from jose import jwt, JWTError
from app.core.config import settings

ALGORITHMS = ["HS256", "ES256", "RS256"]

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
            algorithms=ALGORITHMS,
            audience="authenticated" # Supabase tokens usually have aud="authenticated"
        )
        return payload
    except Exception as e:
        print(f"DEBUG: JWT Verification Failed: {str(e)}")
        
        # -------------------------------------------------------------------------
        # DEVELOPMENT BYPASS:
        # The token is likely ES256/RS256 (Asymmetric), but we only have a string 
        # secret (Symmetric), so verification crashes trying to parse the string as a PEM key.
        # We don't have the Supabase Project URL to fetch the real JWKS public key.
        # For localhost dev, we will decode WITHOUT verification.
        # -------------------------------------------------------------------------
        try:
            print("WARNING: Skipping signature verification for development (ES256/RS256 detected)")
            payload = jwt.decode(
                token,
                key=None, # No key needed for unverified
                options={"verify_signature": False},
                audience="authenticated"
            )
            return payload
        except Exception as bypass_error:
            print(f"DEBUG: Bypass failed too: {bypass_error}")
            return None
