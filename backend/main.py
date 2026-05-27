from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from backend.database.connection import connect_db, disconnect_db
from backend.routes.paste_routes import router as paste_router
from backend.rate_limiter import limiter

app = FastAPI(title="Secure Pastebin API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

@app.on_event("startup")
async def startup_event():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_event():
    await disconnect_db()

app.include_router(paste_router)

from fastapi import Request

@app.get("/")
@limiter.limit("30/minute")
async def read_index(request: Request):
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/p/{paste_id}")
@limiter.limit("30/minute")
async def read_paste_page(request: Request, paste_id: str):
    return FileResponse(FRONTEND_DIR / "index.html")

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
