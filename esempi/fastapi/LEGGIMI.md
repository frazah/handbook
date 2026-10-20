# Demo FastAPI: Task API persistente con SQLite

```bash
cd esempi/fastapi
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
fastapi dev main.py
# apri http://127.0.0.1:8000/docs
# in un secondo terminale: python -m pytest -q
```

Endpoint: `GET /health`, `GET /tasks`, `POST /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`. Salva i dati in `tasks.sqlite` (solo uso locale). Il codice crea tabelle senza migrazioni ed è **didattico**, non un template sicuro per deploy pubblico.
