# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

# CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production to restrict origins
    allow_methods=["*"],
    allow_headers=["*"],
)

MUSIC_FOLDER = Path("frontend/assets/music")

@app.get("/api/music-tracks")
def list_music_tracks():
    if not MUSIC_FOLDER.exists():
        return JSONResponse(content={"error": "Music folder not found."}, status_code=404)

    tracks = [f.name for f in MUSIC_FOLDER.iterdir() if f.is_file() and f.suffix == ".mp3"]
    return {"tracks": tracks}

# Serve the music folder as static files
app.mount("/assets/music", StaticFiles(directory=MUSIC_FOLDER), name="music")
