import hashlib
import hmac
import secrets
import time
from typing import Optional

# Application secret key for token signing
AUTH_SECRET = "project-memory-agent-auth-secret-key-2026-secure"


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique cryptographic salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000
    )
    return f"{salt}${key.hex()}"


def verify_password(password: str, hashed: Optional[str]) -> bool:
    """Verifies a plain text password against the stored salt$hash."""
    if not hashed or "$" not in hashed:
        return False
    try:
        salt, expected_hex = hashed.split("$", 1)
        actual_key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000
        )
        return hmac.compare_digest(actual_key.hex(), expected_hex)
    except Exception:
        return False


def create_access_token(user_id: int) -> str:
    """Creates a stateless HMAC-SHA256 signed bearer token."""
    timestamp = int(time.time())
    payload = f"{user_id}:{timestamp}"
    signature = hmac.new(
        AUTH_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_access_token(token: str) -> Optional[int]:
    """Verifies a bearer token and returns the user_id if valid and not expired (7 days)."""
    if not token:
        return None
    try:
        # Strip 'Bearer ' if present
        if token.startswith("Bearer "):
            token = token[7:].strip()

        parts = token.split(":")
        if len(parts) != 3:
            return None

        user_id_str, timestamp_str, sig = parts
        payload = f"{user_id_str}:{timestamp_str}"
        expected_sig = hmac.new(
            AUTH_SECRET.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(sig, expected_sig):
            return None

        # Expire after 7 days (604800 seconds)
        if int(time.time()) - int(timestamp_str) > 604800:
            return None

        return int(user_id_str)
    except Exception:
        return None
