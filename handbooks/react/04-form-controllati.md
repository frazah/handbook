<!-- level: Fondamenti -->
<!-- summary: Form controllati, onChange, onSubmit, FormEvent e callback tipizzata -->
# Form controllati e callback

**Idea:** un input **controllato** visualizza lo state React (`value`) e lo aggiorna tramite `onChange`. Una callback permette al form figlio di comunicare al genitore il nuovo dato.

## 1. Prima capiamo il tipo di una callback

```ts
// TIPO della funzione (nessuna esecuzione):
type AddTaskCallback = (title: string) => void;

// IMPLEMENTAZIONE della funzione (codice eseguibile):
function logTask(title: string): void {
  console.log('Nuova task:', title);
}

const callback: AddTaskCallback = logTask;
```

`title: string` indica il parametro ricevuto; `=> void` significa che non è previsto un risultato da utilizzare. **Non confondere** la freccia nel tipo con la freccia di una funzione JavaScript `() => { ... }`.

## 2. Le props del componente, su più righe

```tsx
// Queste props contengono UNA funzione, non una stringa.
type AddTaskProps = {
  onAdd: (title: string) => void;
};

// Preferiamo "props" intero: niente destructuring iniziale.
function AddTask(props: AddTaskProps) {
  return (
    <button onClick={() => props.onAdd('Fare la spesa')}>
      Aggiungi task di prova
    </button>
  );
}
```

Questa forma didattica sostituisce la firma compressa `function AddTask({ onAdd }: { onAdd: (title: string) => void })`.

## 3. Un form reale: input, validazione e submit

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';

type AddTaskProps = {
  onAdd: (title: string) => void;
};

function AddTask(props: AddTaskProps) {
  // Input controllato: questo valore viene mostrato nel campo.
  const [title, setTitle] = useState('');

  // FormEvent<HTMLFormElement> descrive un evento di submit su <form>.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Impedisce al browser di ricaricare la pagina.

    const cleanedTitle = title.trim();
    if (cleanedTitle.length === 0) {
      return; // Non inviamo task vuote.
    }

    props.onAdd(cleanedTitle); // Comunichiamo il dato al genitore.
    setTitle(''); // Svuotiamo l'input DOPO il submit.
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="task-title">
        Nuova attività
      </label>

      <input
        id="task-title"
        value={title}
        onChange={(event) => {
          // currentTarget è l'input: value è la stringa digitata.
          setTitle(event.currentTarget.value);
        }}
        required
      />

      <button type="submit">
        Aggiungi
      </button>
    </form>
  );
}
```

**Sui generics:** `FormEvent<HTMLFormElement>` indica un evento React associato a un elemento HTML `<form>`. Le parentesi `<...>` forniscono un *parametro di tipo* a `FormEvent` (non sono JSX).

**Attenzione:** `required` e `trim()` aiutano l'esperienza d'uso, ma **non** sostituiscono la validazione sul server.

## 4. Come il genitore riceve la nuova task

```tsx
function App() {
  function handleAddTask(title: string): void {
    console.log('Il genitore ha ricevuto:', title);
  }

  return (
    <AddTask onAdd={handleAddTask} />
  );
}
```

`onAdd={handleAddTask}` passa il **riferimento** alla funzione. La funzione sarà chiamata quando il figlio eseguirà `props.onAdd(...)`.

## 5. Regola rapida per leggere `onChange`

- `onChange={handleChange}` → passo una funzione già definita.
- `onChange={(event) => setTitle(event.currentTarget.value)}` → creo una funzione inline.
- `onChange={setTitle('ciao')}` → **sbagliato**: eseguo il setter durante il render.
