# ========== VARIABLES ==========
FRONTEND_DIR = frontend
BACKEND_DIR = backend
VENV_DIR = venv
PYTHON = $(shell command -v python3 2>/dev/null || command -v python)

# ========== DEFAULT ==========
all: run

# ========== INSTALLATION ==========
install:
	@echo ">>> Creating virtual environment and installing dependencies..."
	@if [ ! -d "$(VENV_DIR)" ]; then \
		$(PYTHON) -m venv $(VENV_DIR); \
	fi
	@$(VENV_DIR)/bin/pip install --upgrade pip
	@$(VENV_DIR)/bin/pip install -r requirements.txt

# ========== BACKEND ==========
run-backend:
	@echo ">>> Starting FastAPI backend (serving frontend)..."
	@$(VENV_DIR)/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir $(BACKEND_DIR)

# ========== FRONTEND ==========
run-frontend:
	@echo ">>> Opening frontend in default browser..."
	@$(PYTHON) -m webbrowser http://localhost:8000

# ========== FULL STACK ==========
run: install
	@echo ">>> Launching full stack (backend + frontend)..."
	@$(MAKE) -j 2 run-backend run-frontend

# ========== CLEAN ==========
clean:
	rm -rf $(VENV_DIR)
