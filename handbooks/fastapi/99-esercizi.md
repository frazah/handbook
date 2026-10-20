# FastAPI — Esercizi

1. Crea `POST /tasks` con `TaskCreate` e risposta `TaskOut` (201).
2. Crea `GET /tasks/{id}` con 404 se assente e query `?done=true` per filtrare.
3. Aggiungi `PATCH /tasks/{id}` con `exclude_unset=True`.
4. Persiste i dati in SQLite con query parametriche o SQLAlchemy.
5. Scrivi test per 201, 404, 422 e modifica riuscita.

**Autovalutazione:** sessioni e stato dei test isolati; nessun token hardcoded.
