# Recipe — Task manager React + FastAPI

**Caso reale semplificato:** un frontend visualizza task e permette di aggiungerne; il backend valida i titoli e salva i dati in SQLite. Include errori HTTP, loading e CORS locale. È un mini-progetto didattico, non un sistema multiutente con autenticazione.

**Prerequisiti:** [React](../Web%20%26%20Backend/React.md), [FastAPI](../Web%20%26%20Backend/FastAPI.md), Node/npm e Python 3.

## Backend — `backend/main.py`

```python
import sqlite3
from contextlib import asynccontextmanager, closing

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_FILE = 'tasks.sqlite3'

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Esempio locale: per produzione sostituisci con migrazioni DB.
    with closing(sqlite3.connect(DB_FILE)) as db, db:
        db.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL
            )
        ''')
    yield

app = FastAPI(lifespan=lifespan)

# Consenti SOLO l'origine Vite, non qualsiasi sito.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type'],
)

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)

class TaskOut(TaskCreate):
    id: int

@app.get('/tasks', response_model=list[TaskOut])
def list_tasks():
    with closing(sqlite3.connect(DB_FILE)) as db, db:
        rows = db.execute('SELECT id, title FROM tasks ORDER BY id DESC').fetchall()
    return [TaskOut(id=row[0], title=row[1]) for row in rows]

@app.post('/tasks', response_model=TaskOut,
          status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate):
    title = payload.title.strip()
    if not title:
        # Lascia a FastAPI/Pydantic il controllo lunghezza iniziale,
        # ma intercetta anche stringhe di soli spazi.
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail='Title cannot be blank')

    with closing(sqlite3.connect(DB_FILE)) as db, db:
        # Placeholder SQLite: mai concatenare input in SQL.
        cursor = db.execute('INSERT INTO tasks(title) VALUES (?)', (title,))
        task_id = cursor.lastrowid
    return TaskOut(id=task_id, title=title)
```

Da `backend/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi uvicorn
uvicorn main:app --reload
```

## Frontend — `frontend/src/App.tsx`

Crea il progetto con `npm create vite@latest frontend -- --template react-ts`, poi `cd frontend && npm install`. In `src/App.tsx` usa:

```tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Task = {
  id: number;
  title: string;
};

const API = 'http://127.0.0.1:8000';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch(`${API}/tasks`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Assumiamo la risposta conforme al backend controllato.
        // Da servizi terzi/esterni è consigliata validazione runtime.
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (caught) {
        if (!controller.signal.aborted) setError(String(caught));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTasks();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const created: Task = await response.json();
      setTasks((previous) => [created, ...previous]);
      setTitle('');
    } catch (caught) {
      setError(`Impossibile aggiungere la task: ${String(caught)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Le mie task</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Nuova task</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Salvataggio…' : 'Aggiungi'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Caricamento…</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

Avvia `npm run dev` da `frontend/`. Se Vite usa una porta diversa dalla 5173, modifica `allow_origins` nel backend. Il backend va avviato separatamente.

**Cosa insegna davvero:** validazione JSON tramite Pydantic, SQLite per persistenza, richieste HTTP, stato React e gestione di fallimenti. **Cosa manca per la produzione:** autenticazione, ownership delle task, migrazioni, test automatici, gestione avanzata delle richieste/cache e deploy sicuro. Puoi aggiungerli quando affronti questi argomenti, non serve trasformare questa ricetta in un corso.
