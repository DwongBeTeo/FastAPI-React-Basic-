from pydantic import BaseModel

#schemas/token.py
class Token(BaseModel):
    access_token: str
    token_type: str