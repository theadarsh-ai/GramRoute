import os
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from server_py.models import RouteRequest, RouteResponse, Mandi
from server_py.agents.orchestrator import optimize_routes
from server_py.agents.data_agent import load_mandis

app = FastAPI(title="GramRoute API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/recommend-route")
def recommend_route(request: RouteRequest) -> RouteResponse:
    try:
        response = optimize_routes(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mandis")
def get_mandis() -> list[Mandi]:
    return load_mandis()


DIST_DIR = Path(__file__).parent.parent / "dist" / "public"


if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
