"""Fixed workflow subprocess entry point.

Request data is accepted only as JSON on stdin, never as Python source or argv.
"""

import argparse
from contextlib import redirect_stdout
import json
import os
import sys
from typing import Any, Dict, Iterable, Tuple


MAX_TOPIC_LENGTH = 20_000
MAX_STDIN_LENGTH = MAX_TOPIC_LENGTH * 8
WORKFLOWS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "public", "workflows.json"
)


def load_allowed_workflow_ids(path: str = WORKFLOWS_PATH) -> Iterable[str]:
    with open(path, "r", encoding="utf-8") as workflow_file:
        catalog = json.load(workflow_file)

    workflow_ids = {
        workflow.get("id")
        for workflow in catalog.get("workflows", [])
        if isinstance(workflow, dict) and isinstance(workflow.get("id"), str)
    }
    if not workflow_ids:
        raise ValueError("No runnable workflows are configured")
    return workflow_ids


def validate_payload(
    payload: Any, allowed_workflow_ids: Iterable[str]
) -> Tuple[str, str]:
    if not isinstance(payload, dict):
        raise ValueError("Request must be a JSON object")

    topic = payload.get("topic")
    workflow_id = payload.get("workflow_id")

    if not isinstance(topic, str) or not topic.strip():
        raise ValueError("Topic is required")
    if len(topic) > MAX_TOPIC_LENGTH:
        raise ValueError(f"Topic exceeds the {MAX_TOPIC_LENGTH} character limit")
    if not isinstance(workflow_id, str) or workflow_id not in set(allowed_workflow_ids):
        raise ValueError("Unknown workflow_id")

    return topic, workflow_id


def read_request(stdin: Any = sys.stdin) -> Tuple[str, str]:
    raw_payload = stdin.read(MAX_STDIN_LENGTH + 1)
    if len(raw_payload) > MAX_STDIN_LENGTH:
        raise ValueError("Request payload is too large")

    try:
        payload: Dict[str, Any] = json.loads(raw_payload)
    except json.JSONDecodeError as error:
        raise ValueError("Request must contain valid JSON") from error

    return validate_payload(payload, load_allowed_workflow_ids())


def execute(streaming: bool) -> int:
    try:
        topic, workflow_id = read_request()

        # Import the workflow engine only after untrusted input has passed the
        # same allowlist and size checks enforced by the Next.js route.
        from crew.main import run_workflow, run_workflow_with_progress

        runner = run_workflow_with_progress if streaming else run_workflow
        # CrewAI is verbose on stdout. Keep stdout reserved for the one final
        # JSON value so the parent process never needs regex-based extraction.
        with redirect_stdout(sys.stderr):
            result = runner(topic, workflow_id)

        print(json.dumps(result, ensure_ascii=False))
        return 0
    except ValueError as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2
    except Exception as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--stream", action="store_true")
    args = parser.parse_args()
    raise SystemExit(execute(args.stream))
