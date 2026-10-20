<!-- level: Fondamenti -->
<!-- summary: useState, click handler, aggiornamenti funzionali e stato immutabile -->
# `useState` ed eventi

**Idea:** uno **state** è una memoria locale di un componente. Aggiornandolo chiedi a React di renderizzare nuovamente la UI.

## 1. Stato minimo

```tsx
import { useState } from 'react';

function Counter() {
  // useState(0) restituisce [valoreAttuale, funzionePerAggiornare].
  // [count, setCount] è destructuring di un ARRAY.
  const [count, setCount] = useState(0);

  function handleIncrement() {
    // Il nuovo valore dipende dal precedente: usiamo un updater.
    setCount((previousCount) => previousCount + 1);
  }

  return (
    <div>
      <output aria-live="polite">{count}</output>
      <button onClick={handleIncrement}>
        Aumenta
      </button>
    </div>
  );
}
```

**Attenzione:** `onClick={handleIncrement}` passa la funzione. `onClick={handleIncrement()}` la *invoca durante il render* e non è ciò che vogliamo.

## 2. Usare i parametri di un evento

```tsx
type BuyButtonProps = {
  productId: string;
  onBuy: (id: string) => void;
};

function BuyButton(props: BuyButtonProps) {
  function handleClick() {
    // Questa callback riceve un ID e avverte il componente genitore.
    props.onBuy(props.productId);
  }

  return (
    <button onClick={handleClick}>
      Acquista
    </button>
  );
}
```

Il tipo `(id: string) => void` **descrive una funzione** che riceve una stringa. `void` indica che il chiamante non usa il suo valore restituito; **non** significa che `onBuy` verrà chiamata automaticamente.

## 3. Aggiornare oggetti senza mutare lo state

```tsx
import { useState } from 'react';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

function TaskExample() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Studiare React', done: false },
    { id: 2, title: 'Fare la spesa', done: true },
  ]);

  function toggleTask(id: number) {
    setTasks((previousTasks) => {
      // map() restituisce un NUOVO array.
      return previousTasks.map((task) => {
        if (task.id !== id) {
          return task; // La task non interessata rimane identica.
        }

        // ...task copia le proprietà; done viene sovrascritta.
        return { ...task, done: !task.done };
      });
    });
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <button onClick={() => toggleTask(task.id)}>
            {task.done ? '✓' : '○'} {task.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

Qui `() => toggleTask(task.id)` **crea una funzione da eseguire al click**. Se scrivessi `toggleTask(task.id)` senza l'arrow function, la chiameresti durante il rendering.

**Errore comune:** `tasks[0].done = true` oppure `tasks.push(newTask)` mutano lo stato esistente. Preferisci `map`, `filter`, spread e setter.

## 4. Stato vs variabile locale

Una variabile `let count = 0` dichiarata nel corpo del componente viene ricreata a ogni render; modificarla non provoca un render. `useState` serve proprio a conservare un valore e aggiornare l'interfaccia.
