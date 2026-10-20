import { useMemo, useState, type FormEvent } from 'react';
import './style.css';

type Task = { id: string; title: string; done: boolean };
type Filter = 'all' | 'active' | 'done';
export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Studiare React', done: true },
    { id: '2', title: 'Provare FastAPI', done: false },
  ]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const visible = useMemo(() => tasks.filter(t => filter === 'all' || t.done === (filter === 'done')), [tasks, filter]);
  const completed = tasks.filter(t => t.done).length;

  function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks(old => [...old, { id: crypto.randomUUID(), title: title.trim(), done: false }]);
    setTitle('');
  }
  function toggle(id: string) {
    setTasks(old => old.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  return <main>
    <h1>Task board</h1>
    <p>{completed}/{tasks.length} completate</p>
    <form onSubmit={add}>
      <label htmlFor="new-task">Nuova attività</label>
      <input id="new-task" value={title} onChange={e => setTitle(e.target.value)} placeholder="Cosa devi fare?" />
      <button type="submit">Aggiungi</button>
    </form>
    <nav aria-label="Filtra attività">
      {(['all','active','done'] as const).map(f => (
        <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
      ))}
    </nav>
    <ul>{visible.map(task => <li key={task.id}>
      <label><input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} /> {task.title}</label>
    </li>)}</ul>
  </main>;
}
