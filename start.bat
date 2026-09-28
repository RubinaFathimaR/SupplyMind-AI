@echo off
echo ===================================================
echo SUPPLYMIND AI — LAUNCHING LOCAL DEVELOPMENT PLATFORM
echo ===================================================

echo Starting FastAPI Python Backend on port 8000...
start /b python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --cwd backend

echo Launching React Frontend on port 3000...
cd frontend
npm run dev

pause
