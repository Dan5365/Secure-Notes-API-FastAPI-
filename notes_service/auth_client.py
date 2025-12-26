from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import requests, os

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        response = requests.get(f"{AUTH_SERVICE_URL}/verify-token", params={"token": token},
                                timeout=5)
        if response.status_code == 200:
            return response.json()

        try:
            detail = response.json().get("detail")
        except:
            detail = "Authentication failed"

        raise HTTPException(status_code=response.status_code, detail=detail)

    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Auth service unavailable")




def get_current_admin(user: dict = Depends(get_current_user)):
    if user["role"] not in ["admin", "creator"]:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


def get_creator(user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Только Создатель может")
    return user
