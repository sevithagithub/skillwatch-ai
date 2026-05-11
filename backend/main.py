"""
SkillWatch AI — FastAPI Backend Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import engine, Base
from api import auth, skills, forecast, resources, recommend, regions, graph, matcher, admin

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillWatch AI",
    description="Workforce Early Warning & Skill Intelligence System",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(skills.router)
app.include_router(forecast.router)
app.include_router(resources.router)
app.include_router(recommend.router)
app.include_router(regions.router)
app.include_router(graph.router)
app.include_router(matcher.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "name": "SkillWatch AI",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth/",
            "skills": "/api/skills/",
            "forecast": "/api/forecast/",
            "resources": "/api/resources/",
            "recommend": "/api/recommend/",
            "regions": "/api/regions/",
            "graph": "/api/graph/",
            "matches": "/api/matches/",
            "docs": "/docs",
        }
    }
