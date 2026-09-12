from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.routers import health_facilities, health_workers, analytics
from backend.seed_data import seed_prototype_dataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("Seeding prototype dataset if empty...")
    db = SessionLocal()
    try:
        seed_prototype_dataset(db)
    finally:
        db.close()
        
    logger.info("Application startup complete")
    yield
    # Shutdown
    logger.info("Application shutdown")


app = FastAPI(
    title="Nellai HealthGrid API",
    description="AI-Powered Rural Healthcare Gap Detection and Resource Prioritization for Tirunelveli",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router, prefix="/api", tags=["Analytics & Gap Detection"])
app.include_router(health_facilities.router, prefix="/api/v1", tags=["Health Facilities"])
app.include_router(health_workers.router, prefix="/api/v1", tags=["Health Workers"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Nellai HealthGrid Decision Support API",
        "version": "1.0.0",
        "status": "operational",
        "district": "Tirunelveli"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

