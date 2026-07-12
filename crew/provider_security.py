"""Security invariants for provider routing."""

from copy import deepcopy
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlsplit


DEEPSEEK_OFFICIAL_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_FLASH_MODEL = "deepseek-v4-flash"


def is_deepseek_provider(provider_id: Optional[str], provider: Dict[str, Any]) -> bool:
    base_url = provider.get("baseURL")
    uses_official_host = False
    if isinstance(base_url, str):
        try:
            hostname = (urlsplit(base_url).hostname or "").lower().rstrip(".")
            uses_official_host = hostname == "api.deepseek.com"
        except ValueError:
            pass

    return (
        (provider_id or "").lower() == "deepseek"
        or str(provider.get("type", "")).lower() == "deepseek"
        or uses_official_host
    )


def lock_provider_and_model(
    provider_id: Optional[str],
    provider: Dict[str, Any],
    model: Optional[str] = None,
) -> Tuple[Dict[str, Any], Optional[str]]:
    """Return a copy with official DeepSeek traffic locked to the Flash endpoint/model."""
    locked_provider = deepcopy(provider)

    if not is_deepseek_provider(provider_id, locked_provider):
        return locked_provider, model

    locked_provider["baseURL"] = DEEPSEEK_OFFICIAL_BASE_URL
    locked_provider["models"] = [DEEPSEEK_FLASH_MODEL]
    locked_provider["defaultModel"] = DEEPSEEK_FLASH_MODEL
    return locked_provider, DEEPSEEK_FLASH_MODEL
