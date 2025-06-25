# Define variables
FRONTEND_DIR=frontend
BACKEND_DIR=backend
VENV_DIR=venv
PYTHON=python
PIP=$(VENV_DIR)\Scripts\python.exe -m pip
UVICORN=$(VENV_DIR)\Scripts\uvicorn.exe
ACTIVATE=$(VENV_DIR)\Scripts\activate.bat

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

# Run FastAPI backend directly with venv activated in new cmd window
run-backend:
	@echo ">>> Running FastAPI backend..."
	cmd /c start "" cmd /k "$(ACTIVATE) && $(UVICORN) backend.main:app --reload --host 127.0.0.1 --port 8000"

# Open frontend in browser (fixed)
run-frontend:
	@echo ">>> Opening frontend in browser..."
	cmd /c start "" explorer.exe "$(FRONTEND_DIR)\index.html"

# Run both backend and frontend without recursive make calls
run: install
	@echo ">>> Starting app..."
	cmd /c start "" cmd /k "$(ACTIVATE) && $(UVICORN) backend.main:app --reload --host 127.0.0.1 --port 8000"
	cmd /c start "" explorer.exe "$(FRONTEND_DIR)\index.html"

# Clean venv
clean:
	@echo ">>> Cleaning up..."
	@if exist "$(VENV_DIR)" ( rmdir /S /Q "$(VENV_DIR)" )
