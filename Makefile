# === Configuration ===
FRONTEND_DIR=frontend
BACKEND_DIR=backend
PYTHON=python
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

# Cross-platform Git setup
ifeq ($(OS),Windows_NT)
	SHELL := powershell.exe
	GIT_CHECK_REMOTE = if (-not (git remote | Select-String -Pattern '^origin$$')) { git remote add origin https://github.com/Elliot-Nzei/Calming_app.git }
	GIT_INIT = if (-not (Test-Path .git)) { git init }
else
	SHELL := /bin/bash
	GIT_CHECK_REMOTE = if ! git remote | grep -q "^origin$$"; then git remote add origin https://github.com/Elliot-Nzei/Calming_app.git; fi
	GIT_INIT = if [ ! -d .git ]; then git init; fi
endif

git-init:
	@echo ">>> Setting up Git..."
	@$(GIT_INIT)
	@git add .
	@-git commit -m "update" || echo "Nothing to commit"
	@$(GIT_CHECK_REMOTE)
	@git branch -M main
	@git push -u origin main

test:
	@echo ">>> Testing backend at http://127.0.0.1:8000 ..."
	@$(PYTHON) -c "import sys, urllib.request; \
url = 'http://127.0.0.1:8000'; \
print('Checking backend...'); \
try: \
    response = urllib.request.urlopen(url); \
    print('Backend status:', response.status); \
    assert response.status == 200; \
except Exception as e: \
    print('Backend failed:', e); \
    sys.exit(1)"

ifeq ($(OS),Windows_NT)
	@echo ">>> Testing frontend file..."
	@if exist "$(FRONTEND_DIR)\index.html" ( \
		echo "Frontend index.html exists." \
	) else ( \
		echo "Error: frontend index.html not found." && exit 1 \
	)
else
	@echo ">>> Testing frontend file..."
	@if [ -f "$(FRONTEND_DIR)/index.html" ]; then \
		echo "Frontend index.html exists."; \
	else \
		echo "Error: frontend index.html not found."; exit 1; \
	fi
endif

	@echo ">>> All tests passed!"
