from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Path Setup ===
FRONTEND_DIR = Path("frontend")
TEMPLATE_DIR = FRONTEND_DIR
MUSIC_FOLDER = FRONTEND_DIR / "assets" / "music"
USER_DB = Path("data/users.json")

# === Ensure user DB exists ===
USER_DB.parent.mkdir(parents=True, exist_ok=True)
if not USER_DB.exists():
    USER_DB.write_text(json.dumps({}, indent=2))

messages = []
templates = Jinja2Templates(directory=str(TEMPLATE_DIR))

# === Routes ===

@app.get("/")
def show_startup(request: Request):
    return templates.TemplateResponse("startup.html", {"request": request})

@app.post("/submit-user")
async def submit_user(request: Request, name: str = Form(...), email: str = Form(...)):
    # Load current users
    users = json.loads(USER_DB.read_text())
    users[email] = {"name": name}
    USER_DB.write_text(json.dumps(users, indent=2))

    # Redirect to index.html and set cookie
    response = RedirectResponse(url="/index.html", status_code=303)
    response.set_cookie(key="user_email", value=email)
    return response

@app.get("/api/user-info")
async def get_user_info(request: Request):
    email = request.cookies.get("user_email")
    if not email:
        return JSONResponse(status_code=404, content={"error": "No user cookie found."})

    users = json.loads(USER_DB.read_text())
    if email not in users:
        return JSONResponse(status_code=404, content={"error": "User not found."})

    return {"name": users[email]["name"]}

@app.get("/api/music-tracks")
def list_music_tracks():
    if not MUSIC_FOLDER.exists():
        return JSONResponse({"error": "Music folder not found."}, status_code=404)

    tracks = [f.name for f in MUSIC_FOLDER.iterdir() if f.is_file() and f.suffix == ".mp3"]
    return {"tracks": tracks}

@app.get("/api/messages")
def get_messages():
    return {"messages": messages[-100:]}

@app.post("/api/messages")
async def post_message(request: Request):
    data = await request.json()
    message = data.get("message", "").strip()
    sender = data.get("sender", "").strip()

    if not message:
        return JSONResponse(status_code=400, content={"error": "Empty message"})
    if not sender:
        return JSONResponse(status_code=400, content={"error": "Missing sender id"})

    message = message[:250].replace("\n", " ")
    messages.append({"text": message, "sender": sender})
    return {"status": "success"}

# === Mount static files ===
app.mount("/assets/music", StaticFiles(directory=MUSIC_FOLDER), name="music")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
