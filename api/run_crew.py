"""Authenticated API endpoint to run a CrewAI workflow."""

import os
import sys
from typing import Optional

from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from api.security import is_admin_authorized
from crew.run_workflow import load_allowed_workflow_ids, validate_payload


load_dotenv()
app = FastAPI()


class RunCrewRequest(BaseModel):
    topic: str
    workflow_id: str


@app.post("/api/run_crew")
async def run_crew(
    request: RunCrewRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="X-Admin-Password"),
):
    """Execute an allowlisted workflow for an authenticated administrator."""
    if not is_admin_authorized(os.getenv("ADMIN_PASSWORD"), x_admin_password):
        return JSONResponse(status_code=403, content={"error": "Forbidden"})

    try:
        allowed_workflow_ids = load_allowed_workflow_ids()
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": "Workflow configuration unavailable"},
        )

    try:
        topic, workflow_id = validate_payload(
            {"topic": request.topic, "workflow_id": request.workflow_id},
            allowed_workflow_ids,
        )
    except ValueError as error:
        status_code = 413 if "character limit" in str(error) else 400
        return JSONResponse(status_code=status_code, content={"error": str(error)})

    try:
        # Delay the heavy workflow import until authentication and validation
        # have both succeeded.
        from crew.main import run_workflow as execute_workflow

        result = execute_workflow(topic, workflow_id)
        return JSONResponse(content=result)
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to run workflow"},
        )
