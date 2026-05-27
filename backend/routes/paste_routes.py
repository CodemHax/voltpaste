from fastapi import APIRouter, status, Request
from backend.models.paste import PasteCreate, PasteResponse
from backend.services.paste_service import create_new_paste, get_paste_by_id
from backend.rate_limiter import limiter

router = APIRouter(prefix="/api/pastes")

@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def api_create_paste(request: Request, paste: PasteCreate):
    paste_id = await create_new_paste(paste)
    return {"id": paste_id}

@router.get("/{paste_id}", response_model=PasteResponse)
@limiter.limit("30/minute")
async def api_get_paste(request: Request, paste_id: str):
    paste = await get_paste_by_id(paste_id)
    return PasteResponse(
        id=paste["id"],
        title=paste["title"],
        language=paste.get("language", "plaintext"),
        content=paste["content"],
        iv=paste.get("iv"),
        salt=paste.get("salt"),
        is_encrypted=paste["is_encrypted"],
        max_views=paste.get("max_views", 0),
        views=paste.get("views", 0),
        created_at=paste["created_at"],
        expires_at=paste.get("expires_at")
    )
