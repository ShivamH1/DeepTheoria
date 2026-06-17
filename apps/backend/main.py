from contextlib import asynccontextmanager
from fastapi import FastAPI
from config import settings
from db.history import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db(settings.DATABASE_URL)
    yield
    # Shutdown
    await close_db()


app = FastAPI(lifespan=lifespan)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
