# Sharing state e useReducer

**Idea.** Se due componenti devono condividere/modificare lo stesso dato, sposta lo state al loro antenato comune (*lifting state up*).
Per transizioni articolate usa `useReducer`.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.

```tsx
import { useReducer } from 'react';

type Task = { id: number; title: string; done: boolean };

type Action = { type: 'add'; task: Task } | { type: 'toggle'; id: number };

function reducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'add': return [...state, action.task];
    // map costruisce una nuova collezione trasformando ogni elemento.
    case 'toggle': return state.map(task =>
      task.id === action.id ? { ...task, done: !task.done } : task);
  }
}
function Tasks() {
  const [tasks, dispatch] = useReducer(reducer, []);
  return <button onClick={() => dispatch({ type: 'add', task: {
    id: Date.now(), title: 'Nuova task', done: false
  } })}>Nuova ({tasks.length})</button>;
}
```

**Quando usarlo:** più eventi aggiornano lo stesso dato e vuoi centralizzare le regole.  
Un reducer deve essere puro, senza fetch o side effect.

**Errore comune:** duplicare in state dati già calcolabili da props + state (es. `completedCount` se basta `tasks.filter(...)`).
