# === Configuration ===
FRONTEND_DIR=frontend
BACKEND_DIR=backend
VENV_DIR=venv

ifeq ($(OS),Windows_NT)
    # Windows
    PYTHON=python
    PIP=$(VENV_DIR)\Scripts\python.exe -m pip
    UVICORN=$(VENV_DIR)\Scripts\uvicorn.exe
    ACTIVATE=$(VENV_DIR)\Scripts\activate.bat
    BACKEND_RUN=cmd /c start "" cmd /k "$(ACTIVATE) & $(UVICORN) $(BACKEND_DIR).main:app --reload --host 127.0.0.1 --port 8000"
    FRONTEND_OPEN=cmd /c start "" explorer.exe "$(FRONTEND_DIR)\index.html"
    VENV_EXISTS=IF NOT EXIST "$(VENV_DIR)\Scripts\activate.bat"
    VENV_REMOVE=rmdir /S /Q $(VENV_DIR)
else
    # Unix/macOS
    PYTHON=python3
    PIP=$(VENV_DIR)/bin/pip
    UVICORN=$(VENV_DIR)/bin/uvicorn
    ACTIVATE=source $(VENV_DIR)/bin/activate
    BACKEND_RUN=bash -c "$(ACTIVATE) && $(UVICORN) $(BACKEND_DIR).main:app --reload --host 127.0.0.1 --port 8000"
    FRONTEND_OPEN=xdg-open $(FRONTEND_DIR)/index.html
    VENV_EXISTS=test ! -d $(VENV_DIR)
    VENV_REMOVE=rm -rf $(VENV_DIR)
endif

# === Targets ===

all: run

install:
	@echo ">>> Checking virtual environment..."
ifeq ($(OS),Windows_NT)
	@$(VENV_EXISTS) ( \
		echo Creating venv... & \
		$(PYTHON) -m venv $(VENV_DIR) \
	) else ( \
		echo venv already exists \
	)
else
	@$(VENV_EXISTS) && $(PYTHON) -m venv $(VENV_DIR) || echo "venv already exists"
endif
	@echo ">>> Installing dependencies..."
	@$(PIP) install -r requirements.txt

run-backend:
	@echo ">>> Running backend..."
	@$(BACKEND_RUN)

run-frontend:
	@echo ">>> Opening frontend in browser..."
	@$(FRONTEND_OPEN)

run: install
	@echo ">>> Starting app..."
	@$(BACKEND_RUN)
	@$(FRONTEND_OPEN)

clean:
	@echo ">>> Cleaning virtual environment..."
	@$(VENV_REMOVE)

git-init:
	@echo ">>> Setting up Git..."
	@git init
	@git add .
	@git commit -m "update"
	@git remote add origin https://github.com/Elliot-Nzei/Calming_app.git
	@git branch -M main
	@git push -u origin main
