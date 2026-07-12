import unittest
from pathlib import Path

from crew.provider_security import (
    DEEPSEEK_FLASH_MODEL,
    DEEPSEEK_OFFICIAL_BASE_URL,
    lock_provider_and_model,
    resolve_provider_or_fallback,
)


class ProviderSecurityTest(unittest.TestCase):
    def test_deepseek_provider_is_locked(self):
        provider = {
            "id": "custom-deepseek",
            "type": "deepseek",
            "baseURL": "https://attacker.invalid/v1",
            "apiKey": "not-a-real-key",
            "models": ["deepseek-v4-pro"],
            "defaultModel": "deepseek-v4-pro",
        }

        locked, model = lock_provider_and_model("custom-deepseek", provider, "deepseek-v4-pro")

        self.assertEqual(locked["baseURL"], DEEPSEEK_OFFICIAL_BASE_URL)
        self.assertEqual(locked["models"], [DEEPSEEK_FLASH_MODEL])
        self.assertEqual(locked["defaultModel"], DEEPSEEK_FLASH_MODEL)
        self.assertEqual(model, DEEPSEEK_FLASH_MODEL)
        self.assertEqual(provider["baseURL"], "https://attacker.invalid/v1")

    def test_other_provider_is_unchanged(self):
        provider = {"id": "kimi", "type": "kimi", "baseURL": "https://example.invalid/v1"}
        locked, model = lock_provider_and_model("kimi", provider, "kimi-latest")

        self.assertEqual(locked, provider)
        self.assertEqual(model, "kimi-latest")

    def test_non_deepseek_provider_cannot_run_legacy_pro_model(self):
        provider = {
            "id": "custom-provider",
            "type": "custom",
            "baseURL": "https://proxy.invalid/v1",
        }

        with self.assertRaisesRegex(ValueError, "is forbidden"):
            lock_provider_and_model(
                "custom-provider", provider, "  DeepSeek-V4-Pro  "
            )

        provider_with_legacy_default = dict(
            provider, defaultModel="deepseek-v4-pro"
        )
        with self.assertRaisesRegex(ValueError, "is forbidden"):
            lock_provider_and_model(
                "custom-provider", provider_with_legacy_default
            )

    def test_official_deepseek_url_cannot_masquerade_as_custom(self):
        provider = {
            "id": "custom-provider",
            "type": "custom",
            "baseURL": f"{DEEPSEEK_OFFICIAL_BASE_URL}/",
            "defaultModel": "deepseek-v4-pro",
        }

        locked, model = lock_provider_and_model(
            "custom-provider", provider, "deepseek-v4-pro"
        )

        self.assertEqual(locked["baseURL"], DEEPSEEK_OFFICIAL_BASE_URL)
        self.assertEqual(model, DEEPSEEK_FLASH_MODEL)

        for unicode_base_url in (
            "https://api。deepseek。com/v1",
            "https://api．deepseek．com/v1",
            "https://api｡deepseek｡com/v1",
        ):
            with self.subTest(base_url=unicode_base_url):
                unicode_dot_provider = dict(provider, baseURL=unicode_base_url)
                locked, model = lock_provider_and_model(
                    "custom-provider", unicode_dot_provider, "deepseek-v4-pro"
                )
                self.assertEqual(locked["baseURL"], DEEPSEEK_OFFICIAL_BASE_URL)
                self.assertEqual(model, DEEPSEEK_FLASH_MODEL)

        trailing_dot_provider = dict(provider, baseURL="https://api.deepseek.com./v1")
        locked, model = lock_provider_and_model(
            "custom-provider", trailing_dot_provider, "deepseek-v4-pro"
        )
        self.assertEqual(locked["baseURL"], DEEPSEEK_OFFICIAL_BASE_URL)
        self.assertEqual(model, DEEPSEEK_FLASH_MODEL)

    def test_explicit_missing_provider_fails_closed_without_using_fallback_key(self):
        fallback = {
            "id": "environment",
            "type": "custom",
            "baseURL": "https://api.openai.com/v1",
            "apiKey": "fallback-key",
            "defaultModel": "fallback-model",
        }

        with self.assertRaisesRegex(ValueError, "provider 'deepseek' is unavailable"):
            resolve_provider_or_fallback("deepseek", {}, fallback)

        resolved = resolve_provider_or_fallback(None, {}, fallback)
        self.assertEqual(resolved, fallback)
        self.assertIsNot(resolved, fallback)

    def test_runtime_callers_use_atomic_provider_resolution(self):
        for runtime_path in ("crew/main.py", "crew/llm_config.py"):
            with self.subTest(runtime_path=runtime_path):
                runtime_source = Path(runtime_path).read_text(encoding="utf-8")
                self.assertIn("resolve_provider_or_fallback(", runtime_source)


if __name__ == "__main__":
    unittest.main()
