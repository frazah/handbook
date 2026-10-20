<!-- level: Intermedio -->
<!-- summary: Lifting state up, props callback, useReducer e azioni tipizzate -->
# Condividere lo stato e `useReducer`

**Idea:** se più componenti devono leggere o modificare la stessa lista, conserva lo stato nel loro **genitore comune**. Il genitore distribuisce i dati come props e riceve modifiche tramite callback: *lifting state up*.

## 1. Prima: chi possiede lo stato?

```tsx
import { useState } from 'react';

type TaskListProps = {
  titles: string[];
};

function TaskList(props: TaskListProps) {
  return (
    <ul>
      {props.titles.map((title) => (
        // Qui è soltanto una demo con testi univoci. In una lista reale usa ID stabili.
        <li key={title}>{title}</li>
      ))}
    </ul>
  );
}

function App() {
  const [titles, setTitles] = useState<string[]>([]);

  function handleAdd(title: string): void {
    // Crea un nuovo array: NON chiamare titles.push(title).
    setTitles((previousTitles) => [...previousTitles, title]);
  }

  return (
    <main>
      <AddTask onAdd={handleAdd} />
      <TaskList titles={titles} />
    </main>
  );
}
```

`AddTask` è il componente definito nel capitolo sui form. È possibile usarlo perché riceve una callback `onAdd` che accetta una stringa. In questo esempio dimostrativo, titoli duplicati produrrebbero `key` duplicate: **in un'app reale usa task con ID**, non titoli come identificatori.

## 2. Quando lo stato ha molte operazioni: `useReducer`

Un **reducer** è una funzione pura che riceve lo stato corrente e un'azione e restituisce lo stato successivo. Non chiama `fetch` e non modifica l'array esistente.

```tsx
import { useReducer } from 'react';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

// Union discriminata: "type" dice quale operazione vogliamo effettuare.
type TaskAction =
  | { type: 'add'; task: Task }
  | { type: 'toggle'; id: number }
  | { type: 'remove'; id: number };

function taskReducer(state: Task[], action: TaskAction): Task[] {
  // TypeScript usa action.type per distinguere i campi disponibili.
  switch (action.type) {
    case 'add': {
      // Una nuova lista contiene tutte le task precedenti e quella nuova.
      return [...state, action.task];
    }

    case 'toggle': {
      return state.map((task) => {
        if (task.id !== action.id) {
          return task;
        }

        return { ...task, done: !task.done };
      });
    }

    case 'remove': {
      // filter tiene tutte le task con id differente da quella eliminata.
      return state.filter((task) => task.id !== action.id);
    }
  }
}
```

**Attenzione:** `action.type` non è il tipo TypeScript, ma una normale proprietà JavaScript. La parola `'add'` permette a TypeScript di capire che in quel ramo esiste `action.task`.

## 3. Usare `dispatch` nel componente

```tsx
function Tasks() {
  // useReducer restituisce [stato, funzionePerInviareAzioni].
  const [tasks, dispatch] = useReducer(taskReducer, []);

  function handleAddClick() {
    dispatch({
      type: 'add',
      task: {
        id: Date.now(), // Solo esempio: per ID robusti usa un generatore adatto.
        title: 'Nuova attività',
        done: false,
      },
    });
  }

  return (
    <section>
      <button onClick={handleAddClick}>
        Nuova attività
      </button>
      <p>Totale: {tasks.length}</p>
    </section>
  );
}
```

**Quando scegliere cosa:** usa `useState` per stati semplici e `useReducer` quando molte azioni modificano lo stesso modello con regole articolate.

## 4. Dati derivati: spesso non servono nuovi state

```ts
// Calcola direttamente il numero completate dai dati esistenti.
const completedCount = tasks.filter((task) => task.done).length;
```

In un componente che possiede `tasks`, questo calcolo può avvenire durante il render. Duplicare il conteggio con un altro `useState` può creare incoerenze.
