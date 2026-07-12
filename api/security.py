"""Fail-closed authentication helpers for Python API routes."""

import hmac
from typing import Optional


INSECURE_ADMIN_PASSWORDS = {
    "ai_admin_2025",
    "your-secure-password-here",
}


def is_admin_authorized(
    configured_password: Optional[str], supplied_password: Optional[str]
) -> bool:
    if (
        not configured_password
        or configured_password in INSECURE_ADMIN_PASSWORDS
        or not supplied_password
    ):
        return False

    return hmac.compare_digest(
        configured_password.encode("utf-8"), supplied_password.encode("utf-8")
    )
