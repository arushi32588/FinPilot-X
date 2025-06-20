from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import spending, income, investment_routes, explainer

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(spending.router, prefix="/api")
app.include_router(income.router, prefix="/api")
app.include_router(investment_routes.router, prefix="/api")
app.include_router(explainer.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to FinPilot X API"}
