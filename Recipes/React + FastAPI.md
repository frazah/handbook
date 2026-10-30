# Recipe: dashboard ordini (React + FastAPI)

> Un progetto piccolo ma completo: API FastAPI su SQLite e frontend React + TypeScript per elencare, filtrare, creare ordini e aggiornarne lo stato.
> Concetti in: [FastAPI](../Web%20%26%20Backend/FastAPI.md) · [React](../Web%20%26%20Backend/React.md) · [SQL](../Languages/SQL.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md)

## Cosa impari

- Modelli Pydantic separati per input e output, validazione automatica, errori HTTP corretti.
- Dipendenza `get_db` sostituibile nei test, transazioni, totale calcolato dal server.
- CORS tra due origini in sviluppo.
- Client API tipizzato, stati di caricamento ed errore, aggiornamento della lista dopo una mutazione.

## Struttura

```text
orders-dashboard/
├── backend/
│   ├── main.py
│   └── test_main.py
└── frontend/              # creato con: npm create vite@latest frontend -- --template react-ts
    └── src/
        ├── api.ts
        └── App.tsx
```

## Backend

```python
# illustrativo: backend/main.py — richiede fastapi e uvicorn
import sqlite3
from collections.abc import Iterator
from contextlib import asynccontextmanager
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = "orders.db"
Status = Literal["pending", "paid", "shipped", "cancelled"]

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, sku TEXT UNIQUE, price_cents INTEGER);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, status TEXT NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO products VALUES (1, 'MUG-2', 1299), (2, 'PEN-3', 250), (3, 'BAG-4', 4500);
"""

@asynccontextmanager
async def lifespan(app: FastAPI):
    with sqlite3.connect(DB_PATH) as conn:  # demo: in produzione usa le migrazioni
        conn.executescript(SCHEMA)
    yield

app = FastAPI(title="Orders dashboard", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],  # solo il dev server Vite
                   allow_methods=["GET", "POST", "PATCH"], allow_headers=["content-type"])

def get_db() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

Db = Annotated[sqlite3.Connection, Depends(get_db)]

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)

class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)

class StatusUpdate(BaseModel):
    status: Status

class OrderOut(BaseModel):
    id: int
    status: Status
    total_cents: int
    created_at: str
```

```python
# illustrativo: continua backend/main.py
@app.get("/orders", response_model=list[OrderOut])
def list_orders(db: Db, status: Status | None = None):
    query = "SELECT * FROM orders" + (" WHERE status = ?" if status else "") + " ORDER BY id DESC"
    return [dict(r) for r in db.execute(query, (status,) if status else ())]

@app.post("/orders", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Db):
    ids = [item.product_id for item in payload.items]
    prices = dict(db.execute(  # il prezzo viene dal DB, mai dal client
        f"SELECT id, price_cents FROM products WHERE id IN ({','.join('?' * len(ids))})", ids))
    if missing := set(ids) - prices.keys():
        raise HTTPException(422, f"Prodotti inesistenti: {sorted(missing)}")
    total = sum(prices[i.product_id] * i.quantity for i in payload.items)
    with db:  # transazione
        row = db.execute("INSERT INTO orders (total_cents) VALUES (?) RETURNING *", (total,)).fetchone()
    return dict(row)

@app.patch("/orders/{order_id}", response_model=OrderOut)
def update_status(order_id: int, payload: StatusUpdate, db: Db):
    with db:
        row = db.execute("UPDATE orders SET status = ? WHERE id = ? RETURNING *",
                         (payload.status, order_id)).fetchone()
    if row is None:
        raise HTTPException(404, "Ordine non trovato")
    return dict(row)
```

Il placeholder `IN (?, ?, ...)` è generato dal numero di id, ma i valori restano parametri: niente SQL injection.

### Test

```python
# illustrativo: backend/test_main.py — richiede pytest e httpx
import pytest
from fastapi.testclient import TestClient
import main

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", str(tmp_path / "test.db"))  # DB isolato per ogni test
    with TestClient(main.app) as c:  # `with` esegue il lifespan (crea lo schema)
        yield c

def test_create_computes_total_server_side(client):
    res = client.post("/orders", json={"items": [{"product_id": 1, "quantity": 2}]})
    assert res.status_code == 201
    assert res.json()["total_cents"] == 2598

def test_rejects_unknown_status_and_missing_order(client):
    assert client.patch("/orders/999", json={"status": "lost"}).status_code == 422
    assert client.patch("/orders/999", json={"status": "paid"}).status_code == 404
```

## Frontend

```ts
// illustrativo: frontend/src/api.ts
export type Status = "pending" | "paid" | "shipped" | "cancelled";
export type Order = { id: number; status: Status; total_cents: number; created_at: string };

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.json()).detail ?? res.statusText}`);
  return res.json() as Promise<T>; // in un progetto reale: valida con zod
}

export const api = {
  list: (status?: Status) => request<Order[]>(`/orders${status ? `?status=${status}` : ""}`),
  create: (items: { product_id: number; quantity: number }[]) =>
    request<Order>("/orders", { method: "POST", body: JSON.stringify({ items }) }),
  setStatus: (id: number, status: Status) =>
    request<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
```

```tsx
// illustrativo: frontend/src/App.tsx
import { useCallback, useEffect, useState } from "react";
import { api, type Order, type Status } from "./api";

const STATUSES: Status[] = ["pending", "paid", "shipped", "cancelled"];

export default function App() {
  const [filter, setFilter] = useState<Status | "">("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api.list(filter || undefined).then(setOrders).catch((e) => setError(e.message));
  }, [filter]);

  useEffect(reload, [reload]); // ricarica quando cambia il filtro

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try { await action(); reload(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <main>
      <h1>Ordini</h1>
      <select value={filter} onChange={(e) => setFilter(e.target.value as Status | "")}>
        <option value="">Tutti</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button onClick={() => run(() => api.create([{ product_id: 1, quantity: 2 }]))}>
        Nuovo ordine di prova
      </button>
      {error && <p role="alert">{error}</p>}
      <table>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{(o.total_cents / 100).toFixed(2)} €</td>
              <td>
                <select value={o.status} onChange={(e) => run(() => api.setStatus(o.id, e.target.value as Status))}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

## Come eseguirlo

```bash
# Backend (terminale 1)
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn pytest httpx
uvicorn main:app --reload        # API su http://localhost:8000, docs su /docs
pytest -q

# Frontend (terminale 2)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

## Come estenderlo

- **Paginazione keyset** su `GET /orders` ([SQL](../Languages/SQL.md#paginazione-keyset)) e **TanStack Query** nel frontend per cache e refetch.
- **Autenticazione** con JWT e filtro `customer_id` in ogni query ([FastAPI](../Web%20%26%20Backend/FastAPI.md#autenticazione)).
- **Transizioni di stato valide** (`cancelled` non torna `paid`): 409 Conflict per i passaggi non ammessi.
- **Optimistic UI** con `useOptimistic` (React 19) o aggiornando lo stato prima della risposta.
- **Deploy:** PostgreSQL + migrazioni Alembic, `VITE_API_URL` per l'ambiente, CORS con l'origine di produzione.

## Cosa raccontare a un colloquio

- **Il totale è calcolato dal server**, con i prezzi del database: il client non è affidabile.
- **Modelli separati** (`OrderCreate`, `StatusUpdate`, `OrderOut`): il client non può impostare `id` o `total_cents`, e l'output è filtrato.
- **`get_db` come dipendenza:** il DB si sostituisce nei test, la connessione si chiude sempre e le scritture sono in transazione.
- **CORS ristretto** all'origine del frontend, e perché non è una misura di sicurezza per l'API.
- **Trade-off:** sqlite3 diretto invece di un ORM per semplicità; per crescere, SQLAlchemy + Alembic e una data library nel frontend invece del `useEffect` manuale.
