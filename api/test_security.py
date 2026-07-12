from pathlib import Path
import unittest

from api.security import is_admin_authorized


class PythonApiSecurityTest(unittest.TestCase):
    def test_admin_authentication_fails_closed(self):
        self.assertFalse(is_admin_authorized(None, "anything"))
        self.assertFalse(is_admin_authorized("ai_admin_2025", "ai_admin_2025"))
        self.assertFalse(
            is_admin_authorized(
                "your-secure-password-here", "your-secure-password-here"
            )
        )
        self.assertFalse(is_admin_authorized("secure-password", None))
        self.assertFalse(is_admin_authorized("secure-password", "wrong"))
        self.assertTrue(is_admin_authorized("安全密码", "安全密码"))

    def test_paid_route_uses_auth_and_shared_workflow_validation(self):
        route_source = Path("api/run_crew.py").read_text(encoding="utf-8")

        self.assertIn('alias="X-Admin-Password"', route_source)
        self.assertIn("is_admin_authorized", route_source)
        self.assertIn("load_allowed_workflow_ids", route_source)
        self.assertIn("validate_payload", route_source)


if __name__ == "__main__":
    unittest.main()
