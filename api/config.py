"""
API endpoint to get and update workflow configuration
"""
from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class ConfigUpdateRequest(BaseModel):
    workflows: list
    password: str

@app.get("/api/config")
async def get_config():
    """Get current workflow configuration"""
    try:
        workflows_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'workflows.json')
        
        with open(workflows_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return JSONResponse(content=data)
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/config")
async def update_config(request: ConfigUpdateRequest):
    """Update workflow configuration (requires admin password)"""
    try:
        # Verify admin password
        admin_password = os.getenv("ADMIN_PASSWORD", "ai_admin_2025")
        
        if request.password != admin_password:
            return JSONResponse(
                status_code=401,
                content={"error": "Unauthorized"}
            )
        
        # Update workflows.json
        workflows_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'workflows.json')
        
        new_config = {"workflows": request.workflows}
        
        with open(workflows_path, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, ensure_ascii=False, indent=2)
        
        return JSONResponse(content={"success": True, "message": "Configuration updated"})
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

