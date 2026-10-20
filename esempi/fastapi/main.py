"""Task API SQLite: esempio locale, non production-ready."""
from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3

from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).with_name('tasks.sqlite')

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@asynccontextmanager
async def lifespan(app: FastAPI):
    with connect() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY, title TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)))""")
    yield

app = FastAPI(title='Task API', lifespan=lifespan)

class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)

class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=100)
    done: bool | None = None

class TaskOut(BaseModel):
    id: int
    title: str
    done: bool

def read_task(db: sqlite3.Connection, id: int) -> TaskOut:
    row = db.execute('SELECT id,title,done FROM tasks WHERE id=?', (id,)).fetchone()
    if row is None: raise HTTPException(404, 'Task non trovata')
    return TaskOut(id=row['id'], title=row['title'], done=bool(row['done']))

@app.get('/health')
def health(): return {'status': 'ok'}

@app.get('/tasks', response_model=list[TaskOut])
def list_tasks(done: bool | None = None, limit: int = Query(default=30, ge=1, le=100)):
    sql = 'SELECT id,title,done FROM tasks'
    params: tuple = ()
    if done is not None:
        sql += ' WHERE done=?'
        params = (int(done),)
    sql += ' ORDER BY id DESC LIMIT ?'
    with connect() as db:
        rows = db.execute(sql, (*params, limit)).fetchall()
    return [TaskOut(id=r['id'], title=r['title'], done=bool(r['done'])) for r in rows]

@app.get('/tasks/{id}', response_model=TaskOut)
def get_task(id: int):
    with connect() as db: return read_task(db, id)

@app.post('/tasks', response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def add_task(payload: TaskCreate):
    with connect() as db:
        result = db.execute('INSERT INTO tasks(title) VALUES (?)', (payload.title,))
        return read_task(db, result.lastrowid)

@app.patch('/tasks/{id}', response_model=TaskOut)
def patch_task(id: int, payload: TaskPatch):
    changes = payload.model_dump(exclude_unset=True)
    if any(v is None for v in changes.values()):
        raise HTTPException(422, 'Non sono ammessi null espliciti')
    with connect() as db:
        current = read_task(db, id)
        title = changes.get('title', current.title)
        done = changes.get('done', current.done)
        db.execute('UPDATE tasks SET title=?,done=? WHERE id=?', (title, int(done), id))
        return read_task(db, id)

@app.delete('/tasks/{id}', status_code=204)
def remove_task(id: int):
    with connect() as db:
        read_task(db, id)
        db.execute('DELETE FROM tasks WHERE id=?', (id,))
