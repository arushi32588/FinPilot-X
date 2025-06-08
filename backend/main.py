from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import spending
from backend.routes import transactions

app = FastAPI()

# CORS setup (for frontend requests later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include classifier route
app.include_router(spending.router, prefix="/api/spending")
app.include_router(transactions.router)

@app.get("/")
def root():
    return {"message": "FinPilot X backend running"}
