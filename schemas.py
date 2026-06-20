from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LeadCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    college_name: str
    current_year: str
    target_company: str
    message: str

class LeadResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    college_name: str
    current_year: str
    target_company: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
