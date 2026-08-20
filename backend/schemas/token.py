from pydantic import BaseModel

#schemas/token.py
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str #Dùng để client gửi request refresh và logout