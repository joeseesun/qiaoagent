"""
API endpoint to run CrewAI workflow
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sys
import os

# Add parent directory to path to import crew module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from crew.main import run_workflow

app = FastAPI()

class RunCrewRequest(BaseModel):
    topic: str
    workflow_id: str

@app.post("/api/run_crew")
async def run_crew(request: RunCrewRequest):
    """Execute CrewAI workflow with given topic and workflow_id"""
    try:
        result = run_workflow(request.topic, request.workflow_id)
        
        return JSONResponse(content=result)
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

