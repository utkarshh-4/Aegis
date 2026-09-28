import os
import shutil
from pathlib import Path

def restructure():
    base = Path("/Users/apple/Downloads/Aegis")
    
    # 1. Rename client to frontend
    client_dir = base / "client"
    frontend_dir = base / "frontend"
    if client_dir.exists() and not frontend_dir.exists():
        shutil.move(str(client_dir), str(frontend_dir))
    
    # 2. Rename server to backend
    server_dir = base / "server"
    backend_dir = base / "backend"
    if server_dir.exists() and not backend_dir.exists():
        shutil.move(str(server_dir), str(backend_dir))
        
    # Create DB dir
    if (backend_dir / "data").exists():
        shutil.move(str(backend_dir / "data"), str(backend_dir / "db"))
        
    # We will let index.js remain as the main entry point, but modify it to use routes.
    # Actually, the user asked for "backend logic for them" (the options).
    # Currently: Overview, Attack Surface, Assessments, Findings, Evidence, Reports, Methodology.
    
    # I'll create backend/src/routes and backend/src/controllers and migrate the express logic there.
    pass

if __name__ == "__main__":
    restructure()
