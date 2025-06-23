# Variables
FRONTEND_DIR=frontend
BACKEND_DIR=backend
VENV_DIR=venv
PYTHON=$(shell command -v python3 2>/dev/null || command -v python)

# Default target
all: run

# Create virtual environment and install dependencies if venv doesn't exist
install:
ifeq ("$(wildcard $(VENV_DIR)/bin/activate)","")
	@echo "Creating new virtual environment..."
	$(PYTHON) -m venv $(VENV_DIR)
	@echo "Installing dependencies..."
	$(VENV_DIR)/bin/pip install --upgrade pip
	$(VENV_DIR)/bin/pip install -r requirements.txt
else
	@echo "Virtual environment already exists. Skipping creation."
endif

# Run backend with uvicorn using existing or activated venv
run-backend:
	@echo "Running FastAPI backend..."
	@if [ -z "$$VIRTUAL_ENV" ]; then \
		echo "Using internal venv..."; \
		$(VENV_DIR)/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir $(BACKEND_DIR); \
	else \
		echo "Using activated virtualenv..."; \
		uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir $(BACKEND_DIR); \
	fi

# Open frontend locally
run-frontend:
	@echo "Opening frontend in browser..."
	$(PYTHON) -m webbrowser $(FRONTEND_DIR)/index.html

# Run both frontend and backend
run: install
	@echo "Launching both frontend and backend..."
	$(MAKE) -j 2 run-backend run-frontend

# Clean venv
clean:
	rm -rf $(VENV_DIR)
