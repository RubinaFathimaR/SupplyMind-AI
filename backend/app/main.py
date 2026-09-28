import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed.generator import seed_database
from app.ml.engine import risk_ml_engine
from app.api.router import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed synthetic dataset (300+ suppliers)
        seed_database(db)
        
        # Train ML Risk Engine
        print("Training ML Risk Engine on dataset...")
        risk_ml_engine.train_and_evaluate(db)
    finally:
        db.close()
        
    print("SupplyMind AI Backend Startup Complete!")

# Mount API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "docs_url": "/docs"
    }
