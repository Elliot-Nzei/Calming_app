# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

app = FastAPI()

# CORS middleware - adjust allow_origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
FRONTEND_DIR = Path("frontend")
MUSIC_FOLDER = FRONTEND_DIR / "assets" / "music"

# In-memory message store for chat
messages = []

# API to list music tracks
@app.get("/api/music-tracks")
def list_music_tracks():
    if not MUSIC_FOLDER.exists():
        return JSONResponse({"error": "Music folder not found."}, status_code=404)
    tracks = [f.name for f in MUSIC_FOLDER.iterdir() if f.is_file() and f.suffix == ".mp3"]
    return {"tracks": tracks}

# Chat GET messages
@app.get("/api/messages")
def get_messages():
    return {"messages": messages[-100:]}

# Chat POST message
@app.post("/api/messages")
async def post_message(request: Request):
    data = await request.json()
    message = data.get("message", "").strip()
    if not message:
        return JSONResponse(status_code=400, content={"error": "Empty message"})
    message = message[:250].replace("\n", " ")
    messages.append(message)
    return {"status": "success"}

# Serve music static files (allow frontend to access songs)
app.mount("/assets/music", StaticFiles(directory=MUSIC_FOLDER), name="music")

# Serve all frontend static files
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
