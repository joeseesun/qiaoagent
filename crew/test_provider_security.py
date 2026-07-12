import unittest

from crew.provider_security import (
    DEEPSEEK_FLASH_MODEL,
    DEEPSEEK_OFFICIAL_BASE_URL,
    lock_provider_and_model,
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

        trailing_dot_provider = dict(provider, baseURL="https://api.deepseek.com./v1")
        locked, model = lock_provider_and_model(
            "custom-provider", trailing_dot_provider, "deepseek-v4-pro"
        )
        self.assertEqual(locked["baseURL"], DEEPSEEK_OFFICIAL_BASE_URL)
        self.assertEqual(model, DEEPSEEK_FLASH_MODEL)


if __name__ == "__main__":
    unittest.main()
