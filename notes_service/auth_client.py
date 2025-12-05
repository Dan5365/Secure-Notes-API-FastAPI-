import requests
from fastapi import HTTPException, Header

AUTH_SERVICE_URL = "http://auth-service:8000"

def get_current_user(authorization: str = Header(...)):

    token = authorization.replace("Bearer ", "")
    try:
        response = requests.get(f"{AUTH_SERVICE_URL}/verify-token", params={"token": token})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json().get("detail"))
        return response.json()
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Auth service unreachable")
