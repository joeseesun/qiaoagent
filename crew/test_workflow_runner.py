import json
import os
import subprocess
import sys
import tempfile
import unittest

from crew.run_workflow import MAX_TOPIC_LENGTH, validate_payload


class WorkflowRunnerSecurityTest(unittest.TestCase):
    def test_payload_validation_preserves_topic_as_data(self):
        topic = "'); __import__('os').system('echo owned'); #"
        validated_topic, workflow_id = validate_payload(
            {"topic": topic, "workflow_id": "allowed"}, {"allowed"}
        )

        self.assertEqual(validated_topic, topic)
        self.assertEqual(workflow_id, "allowed")

    def test_unknown_workflow_and_oversized_topic_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unknown workflow_id"):
            validate_payload({"topic": "safe", "workflow_id": "unknown"}, {"allowed"})

        with self.assertRaisesRegex(ValueError, "character limit"):
            validate_payload(
                {"topic": "x" * (MAX_TOPIC_LENGTH + 1), "workflow_id": "allowed"},
                {"allowed"},
            )

    def test_workflow_id_cannot_be_executed_as_python_source(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            sentinel = os.path.join(temp_dir, "executed")
            workflow_id = (
                "wechat_title_creator'); open("
                + repr(sentinel)
                + ", 'w').write('owned'); #"
            )
            completed = subprocess.run(
                [sys.executable, "-m", "crew.run_workflow"],
                input=json.dumps({"topic": "safe", "workflow_id": workflow_id}),
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(completed.returncode, 2)
            self.assertIn("Unknown workflow_id", completed.stderr)
            self.assertFalse(os.path.exists(sentinel))


if __name__ == "__main__":
    unittest.main()
