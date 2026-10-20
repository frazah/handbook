# useEffect, fetch e cleanup

**Idea.** `useEffect` serve a sincronizzare la UI con sistemi esterni (rete, WebSocket, DOM non React).
**Non** usarlo per derivare un dato che puoi calcolare durante il render. <https://react.dev/learn/you-might-not-need-an-effect>

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`useState`**: Hook che conserva una variabile di stato fra i render.
- **`key`**: identificatore stabile che aiuta React a distinguere gli elementi di una lista.

```tsx
import { useEffect, useState } from 'react';

type Task = { id: number; title: string };

function TaskFeed() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Lo stato persiste tra i render: aggiornalo con la funzione setter.
  const [error, setError] = useState('');
  // Sincronizza una risorsa esterna; la callback può restituire una cleanup.
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch('/api/tasks', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTasks(await res.json()); // in produzione valida il JSON
      } catch (err) {
        if (!controller.signal.aborted) setError(String(err));
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  if (error) return <p role="alert">{error}</p>;
  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

**Attenzione:** gli Effect in modalità Strict Mode (sviluppo) possono eseguire cicli extra di setup/cleanup: scrivi cleanup corretto.  
Per app complesse valuta un sistema di cache/query o il data loading del framework.
