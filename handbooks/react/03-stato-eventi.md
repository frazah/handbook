# useState e gestione degli eventi

**Idea.** Lo *state* è memoria locale che provoca un nuovo render.
Ogni render vede uno snapshot dello stato; per un update basato sul valore precedente usa la funzione `prev => ...`.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`useState`**: Hook che conserva una variabile di stato fra i render.

```tsx
import { useState } from 'react';

function CartCounter() {
  // Lo stato persiste tra i render: aggiornalo con la funzione setter.
  const [items, setItems] = useState(0);
  return (
    <div>
      <button onClick={() => setItems(n => Math.max(0, n - 1))}>−</button>
      <output aria-live="polite">{items}</output>
      <button onClick={() => setItems(n => n + 1)}>+</button>
    </div>
  );
}
```

## Aggiornare oggetti e array senza mutarli

```tsx
// Lo stato persiste tra i render: aggiornalo con la funzione setter.
const [tasks, setTasks] = useState([{ id: 1, done: false }]);
const toggle = (id: number) => setTasks(old =>
  // map costruisce una nuova collezione trasformando ogni elemento.
  old.map(task => task.id === id ? { ...task, done: !task.done } : task)
);
```

**Attenzione:** non fare `tasks.push(...)` oppure `tasks[0].done = true` e poi aspettarti aggiornamenti affidabili.  
Crea nuove strutture.
