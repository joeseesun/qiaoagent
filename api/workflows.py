"""
API endpoint to get available workflows
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI()

@app.get("/api/workflows")
async def get_workflows():
    """Get list of available workflows"""
    try:
        # Read workflows from public/workflows.json
        workflows_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'workflows.json')
        
        with open(workflows_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Return simplified workflow list
        workflows = [
            {
                "id": workflow["id"],
                "name": workflow["name"]
            }
            for workflow in data.get("workflows", [])
        ]
        
        return JSONResponse(content={"workflows": workflows})
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

