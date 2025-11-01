"""
API endpoint for admin authentication
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class AuthRequest(BaseModel):
    password: str

@app.post("/api/auth")
async def authenticate(request: AuthRequest):
    """Verify admin password"""
    try:
        admin_password = os.getenv("ADMIN_PASSWORD", "ai_admin_2025")
        
        if request.password == admin_password:
            return JSONResponse(content={"authorized": True})
        else:
            return JSONResponse(
                status_code=401,
                content={"authorized": False, "error": "Invalid password"}
            )
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

