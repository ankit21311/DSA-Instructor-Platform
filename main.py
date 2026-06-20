from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import models
from database import engine, SessionLocal
import contact, auth, admin
from auth_service import get_password_hash

# Create tables
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: Create default admin user if not exists
    db = SessionLocal()
    try:
        admin_email = "admin@example.com"
        admin_user = db.query(models.AdminUser).filter(models.AdminUser.email == admin_email).first()
        if not admin_user:
            hashed_password = get_password_hash("admin123")
            new_admin = models.AdminUser(email=admin_email, password_hash=hashed_password)
            db.add(new_admin)
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(title="DSA Instructor Platform API", lifespan=lifespan)

app.mount("/static", StaticFiles(directory="."), name="static")

templates = Jinja2Templates(directory=".")

app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(admin.router)

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})
