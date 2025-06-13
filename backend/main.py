from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import spending

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(spending.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "FinPilot X backend running"}
