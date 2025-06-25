# Define variables
FRONTEND_DIR=frontend
BACKEND_DIR=backend
VENV_DIR=venv
PYTHON=python
PIP=$(VENV_DIR)\Scripts\python.exe -m pip
UVICORN=$(VENV_DIR)\Scripts\uvicorn

# Default target
all: run

# Install dependencies
install:
	@echo ">>> Checking virtual environment..."
	@if not exist "$(VENV_DIR)" ( \
		echo ">>> Creating virtual environment..." && \
		$(PYTHON) -m venv $(VENV_DIR) \
	)
	@echo ">>> Installing dependencies..."
	@$(PIP) install -r requirements.txt

# Run FastAPI backend
run-backend:
	@echo ">>> Running FastAPI backend..."
	start cmd /K "$(UVICORN) backend.main:app --reload --host 127.0.0.1 --port 8000"

# Open frontend
run-frontend:
	@echo ">>> Opening frontend in browser..."
	start $(FRONTEND_DIR)\index.html

# Run both backend and frontend
run: install
	@echo ">>> Starting app..."
	start cmd /K "$(MAKE) run-backend"
	start cmd /C "$(MAKE) run-frontend"

# Delete venv
clean:
	@echo ">>> Cleaning up..."
	@if exist "$(VENV_DIR)" ( rmdir /S /Q $(VENV_DIR) )
