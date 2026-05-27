import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from backend.database.connection import get_collection
from backend.models.paste import PasteCreate

async def create_new_paste(paste: PasteCreate) -> str:
    collection = get_collection()
    for _ in range(10):
        paste_id = secrets.token_urlsafe(6)
        existing = await collection.find_one({"id": paste_id})
        if not existing:
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique paste ID."
        )

    now = datetime.now(timezone.utc)
    expires_at = None
    if paste.expires_in_minutes is not None:
        expires_at = now + timedelta(minutes=paste.expires_in_minutes)

    paste_doc = {
        "id": paste_id,
        "title": paste.title or "Untitled",
        "language": paste.language or "plaintext",
        "content": paste.content,
        "iv": paste.iv,
        "salt": paste.salt,
        "is_encrypted": paste.is_encrypted,
        "max_views": paste.max_views or 0,
        "views": 0,
        "created_at": now,
        "expires_at": expires_at
    }

    await collection.insert_one(paste_doc)
    return paste_id

async def get_paste_by_id(paste_id: str):
    collection = get_collection()
    paste = await collection.find_one({"id": paste_id})
    if not paste:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paste not found or expired."
        )

    now = datetime.now(timezone.utc)
    if paste.get("expires_at") is not None:
        expires_at = paste["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if now > expires_at:
            await collection.delete_one({"id": paste_id})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paste not found or expired."
            )

    new_views = paste.get("views", 0) + 1
    max_views = paste.get("max_views", 0)
    
    if max_views > 0 and new_views >= max_views:
        await collection.delete_one({"id": paste_id})
        paste["views"] = new_views
        return paste

    await collection.update_one(
        {"id": paste_id},
        {"$set": {"views": new_views}}
    )
    
    paste["views"] = new_views
    return paste
