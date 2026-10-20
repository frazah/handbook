# React + FastAPI: lista task con API

**Obiettivo:** collegare un'interfaccia React + TypeScript a una piccola API Python. In questa prima versione i dati restano in memoria: riavviando l'API si azzerano. La ricetta è autonoma e non richiede database o autenticazione.

## 1. Organizzazione del progetto

```text
task-demo/
├── backend/
│   └── main.py
└── frontend/           # generato da Vite
    └── src/App.tsx
```

Servono Python e Node.js installati. Apri **due terminali**, uno per il backend e uno per il frontend.

## 2. API FastAPI (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite in sviluppo
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)

class Task(TaskIn):
    id: int

items: list[Task] = []

@app.get("/tasks", response_model=list[Task])
def read_tasks():
    return items

@app.post("/tasks", response_model=Task, status_code=201)
def add_task(payload: TaskIn):
    task = Task(id=len(items) + 1, title=payload.title)
    items.append(task)
    return task
```

Avvia il backend dalla cartella `backend/`:

```bash
python -m pip install fastapi uvicorn
python -m uvicorn main:app --reload
```

Verifica `http://127.0.0.1:8000/docs`. **CORS** è necessario perché il frontend gira su un'altra origine (porta 5173). Non mettere `allow_origins=["*"]` insieme a cookie/credenziali in produzione.

## 3. Frontend React + TypeScript (`frontend/src/App.tsx`)

Crea il frontend (con Node.js e npm):

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

Sostituisci `src/App.tsx` con:

```tsx
import { useEffect, useState, type FormEvent } from "react";

type Task = { id: number; title: string };
const BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadTasks() {
      try {
        const response = await fetch(`${BASE_URL}/tasks`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setTasks((await response.json()) as Task[]);
      } catch (reason) {
        if (!controller.signal.aborted) setError(String(reason));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTasks();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const created = (await response.json()) as Task;
      setTasks((prev) => [...prev, created]);
      setTitle("");
    } catch (reason) {
      setError(String(reason));
    }
  }

  return (
    <main>
      <h1>Le mie task</h1>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nuova task" />
        <button type="submit">Aggiungi</button>
      </form>
      {loading && <p>Caricamento...</p>}
      {error && <p role="alert">Errore: {error}</p>}
      <ul>{tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
    </main>
  );
}
```

## 4. Come funziona davvero

- `useEffect` avvia il GET al montaggio del componente. `AbortController` evita di aggiornare lo stato dopo lo smontaggio.
- `response.ok` verifica gli errori HTTP: `fetch` **non** rifiuta automaticamente le risposte 400 o 500.
- Il `POST` serializza il JSON; FastAPI/Pydantic controlla i dati in ingresso e risponde con `201 Created`.
- React aggiorna la lista usando la risposta del server, non ipotizzando l'ID della nuova task.

## 5. Errori comuni ed evoluzioni

- **`Failed to fetch`?** Controlla porta del backend, processo attivo e policy CORS.
- **422 Unprocessable Entity?** Controlla il body JSON; `title` deve essere una stringa non vuota.
- **Dati persi al restart?** È voluto in questa demo: per conservarli passa a SQLite/PostgreSQL.
- **Produzione:** configura URL API con variabili d'ambiente, aggiungi auth, test, persistenza e un client HTTP tipizzato.

**Per approfondire:** [React](#book/react) · [TypeScript](#book/typescript) · [FastAPI](#book/fastapi).
