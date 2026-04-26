from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import requests
import os

AUTH_URL = os.getenv("AUTH_SERVICE_URL") or "http://localhost:8000"


security = HTTPBearer()


def get_current_user(credentials=Depends(security)):
    token = credentials.credentials

    try:
        response = requests.get(
            f"{AUTH_URL}/auth/verify-token",
            params={"token": token},
            timeout=5
        )

        if response.status_code == 200:
            return response.json()

        raise HTTPException(
            status_code=response.status_code,
            detail="Invalid token"
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Auth service error"
        )


def get_current_admin(user=Depends(get_current_user)):
    if user["role"] not in ["admin", "creator"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


def get_creator(user=Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Только Создатель может")
    return user