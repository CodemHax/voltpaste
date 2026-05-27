from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class PasteCreate(BaseModel):
    content: str
    iv: Optional[str] = None
    salt: Optional[str] = None
    title: Optional[str] = "Untitled"
    language: Optional[str] = "plaintext"
    is_encrypted: bool = True
    max_views: Optional[int] = 0
    expires_in_minutes: Optional[int] = None

class PasteResponse(BaseModel):
    id: str
    title: Optional[str]
    language: Optional[str]
    content: str
    iv: Optional[str]
    salt: Optional[str]
    is_encrypted: bool
    max_views: Optional[int]
    views: int
    created_at: datetime
    expires_at: Optional[datetime]
