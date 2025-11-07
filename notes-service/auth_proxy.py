import requests
from fastapi import HTTPException

AUTH_SERVICE_URL = "http://auth-service:8001"

def get_current_user(token: str):
    try:
        result = requests.get(f"{AUTH_SERVICE_URL}/verify-token", params={"token": token})
        if result.status_code != 200:
            raise HTTPException(status_code=result.status_code, detail=result.json().get("detail"))
        return result.json()
    except Exception:
        raise HTTPException(status_code=500, detail="Unreachable")
