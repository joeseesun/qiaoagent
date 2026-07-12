"""Security invariants for provider routing."""

from copy import deepcopy
from typing import Any, Dict, Optional, Tuple


DEEPSEEK_OFFICIAL_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_FLASH_MODEL = "deepseek-v4-flash"


def is_deepseek_provider(provider_id: Optional[str], provider: Dict[str, Any]) -> bool:
    return (provider_id or "").lower() == "deepseek" or provider.get("type") == "deepseek"


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
