"""Security invariants for provider routing."""

from copy import deepcopy
from typing import Any, Dict, Mapping, Optional, Tuple
from urllib.parse import urlsplit


DEEPSEEK_OFFICIAL_BASE_URL = "https://api.deepseek.com/v1"
DEEPSEEK_FLASH_MODEL = "deepseek-v4-flash"
FORBIDDEN_DEEPSEEK_MODEL = "deepseek-v4-pro"
UNICODE_DOT_TRANSLATION = str.maketrans({
    "\u3002": ".",
    "\uff0e": ".",
    "\uff61": ".",
})


def normalize_hostname(base_url: Any) -> str:
    if not isinstance(base_url, str):
        return ""

    try:
        hostname = urlsplit(base_url).hostname or ""
    except ValueError:
        return ""

    hostname = hostname.translate(UNICODE_DOT_TRANSLATION).rstrip(".")
    try:
        return hostname.encode("idna").decode("ascii").lower().rstrip(".")
    except UnicodeError:
        return ""


def is_deepseek_provider(provider_id: Optional[str], provider: Dict[str, Any]) -> bool:
    uses_official_host = normalize_hostname(provider.get("baseURL")) == "api.deepseek.com"

    return (
        (provider_id or "").lower() == "deepseek"
        or str(provider.get("type", "")).lower() == "deepseek"
        or uses_official_host
    )


def resolve_provider_or_fallback(
    provider_id: Optional[str],
    providers: Mapping[str, Dict[str, Any]],
    fallback_provider: Dict[str, Any],
) -> Dict[str, Any]:
    """Resolve one provider atomically; explicit missing providers never fall back."""
    if provider_id:
        if provider_id not in providers:
            raise ValueError(f"Configured provider '{provider_id}' is unavailable")
        return deepcopy(providers[provider_id])

    return deepcopy(fallback_provider)


def lock_provider_and_model(
    provider_id: Optional[str],
    provider: Dict[str, Any],
    model: Optional[str] = None,
) -> Tuple[Dict[str, Any], Optional[str]]:
    """Return a copy with official DeepSeek traffic locked to the Flash endpoint/model."""
    locked_provider = deepcopy(provider)
    targets_deepseek = is_deepseek_provider(provider_id, locked_provider)
    effective_model = model if model is not None else locked_provider.get("defaultModel")

    if (
        isinstance(effective_model, str)
        and effective_model.strip().lower() == FORBIDDEN_DEEPSEEK_MODEL
        and not targets_deepseek
    ):
        raise ValueError(
            f"Model '{FORBIDDEN_DEEPSEEK_MODEL}' is forbidden outside the official DeepSeek Flash route"
        )

    if not targets_deepseek:
        return locked_provider, model

    locked_provider["baseURL"] = DEEPSEEK_OFFICIAL_BASE_URL
    locked_provider["models"] = [DEEPSEEK_FLASH_MODEL]
    locked_provider["defaultModel"] = DEEPSEEK_FLASH_MODEL
    return locked_provider, DEEPSEEK_FLASH_MODEL
