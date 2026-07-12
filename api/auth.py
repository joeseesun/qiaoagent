"""
API endpoint for admin authentication
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import hmac
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class AuthRequest(BaseModel):
    password: str

@app.post("/api/auth")
async def authenticate(request: AuthRequest):
    """Verify admin password"""
    try:
        admin_password = os.getenv("ADMIN_PASSWORD")

        if not admin_password or admin_password in {"ai_admin_2025", "your-secure-password-here"}:
            return JSONResponse(
                status_code=403,
                content={"authorized": False, "error": "Admin access is disabled"}
            )

        if hmac.compare_digest(request.password, admin_password):
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
