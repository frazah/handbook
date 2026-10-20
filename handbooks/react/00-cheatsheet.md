<!-- level: Consultazione -->
<!-- summary: Sintassi React + TypeScript, JSX, props, callback, stato, liste, form, effect e hook -->
# React + TypeScript — Cheatsheet consultabile

Questa pagina è un **promemoria rapido**, non la prima lezione. Se una firma come `(title: string) => void` ti sembra oscura, parti da **`00a-come-leggere-tsx.md`**.

## Sintassi da trovare al volo

| Vuoi fare... | Scrivi... | Nota |
|---|---|---|
| Definire props | `type Props = { name: string }` | tipo dichiarato separatamente |
| Prop facoltativa | `name?: string` | può mancare |
| Usare props | `function Card(props: Props)` | facile da leggere |
| Destructuring | `function Card({ name }: Props)` | solo quando già familiare |
| Inserire JS nel JSX | `<h2>{name}</h2>` | graffe = espressione |
| Classe CSS | `<div className="card">` | non `class` |
| Evento click | `<button onClick={handleClick}>` | passa funzione, non chiamarla |
| Evento con argomento | `onClick={() => remove(id)}` | funzione wrapper |
| Callback in una prop | `onAdd: (title: string) => void` | tipo di funzione |
| Contenuto annidato | `children: ReactNode` | importa il tipo da React |
| Condizione | `{ready ? <List /> : <Spinner />}` | ternario |
| Lista | `items.map(item => <li key={item.id}>...)` | ID stabile |
| Fragment | `<>...</>` | niente wrapper DOM |
| Stato locale | `const [x, setX] = useState(0)` | valore + setter |
| Setter dal precedente | `setX(previous => previous + 1)` | evita snapshot obsoleti |
| Form controllato | `value={text}` + `onChange={...}` | state = fonte del valore |
| Effect | `useEffect(setup, [deps])` | sincronizzazione esterna |
| Cleanup | `return () => controller.abort()` | chiusura risorsa |
| Context | `createContext` + `useContext` | dato condiviso |
| Stato articolato | `useReducer(reducer, initial)` | azioni tipizzate |

## Props e callback: modello consigliato

```tsx
// 1. Il tipo delle props è leggibile anche da solo.
type BuyButtonProps = {
  label: string;
  disabled?: boolean;
  onBuy: (productId: string) => void;
  productId: string;
};

// 2. Prima delle abbreviazioni, possiamo usare "props".
function BuyButton(props: BuyButtonProps) {
  function handleBuy() {
    // La funzione arriva dal genitore: la invochiamo AL CLICK.
    props.onBuy(props.productId);
  }

  return (
    <button
      disabled={props.disabled ?? false}
      onClick={handleBuy}
    >
      {props.label}
    </button>
  );
}
```

- `disabled?` rende la prop opzionale.
- `?? false` sceglie `false` solo se `disabled` è `null` o `undefined`.
- `(productId: string) => void` è **il tipo di una funzione**, non una chiamata.

## Stato e array immutabili

```tsx
import { useState } from 'react';

type Todo = { id: number; done: boolean };

function Demo() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);

  function increment() {
    setCount((previous) => previous + 1);
  }

  function markDone(id: number) {
    setTodos((previous) => previous.map((todo) => {
      if (todo.id !== id) return todo;
      return { ...todo, done: true }; // Nuovo oggetto per elemento modificato.
    }));
  }

  return <button onClick={increment}>Conteggio: {count}</button>;
}
```

**Non fare:** `todos.push(...)`, `todos[0].done = true` oppure `setCount(count + 1)` più volte aspettandoti sempre incrementi cumulativi.

## Form: firma da ricordare

```tsx
import type { FormEvent } from 'react';

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); // Evita navigazione/refresh standard del browser.
}

// Nel componente:
// <form onSubmit={handleSubmit}>...</form>
```

`FormEvent<HTMLFormElement>` specifica a TypeScript l'elemento che genera l'evento.

## Hook: quale scegliere?

| Hook | Uso tipico | Da evitare |
|---|---|---|
| `useState` | input, contatori, flag | dati derivati duplicati |
| `useReducer` | state con molte azioni | reducer con side effect |
| `useEffect` | rete, timer, listener | calcoli da props/state |
| `useRef` | riferimento DOM, valore mutabile | usarlo per dati da mostrare a video |
| `useMemo` | calcolo costoso misurato | ottimizzare ogni variabile |
| `useCallback` | identità funzione quando conta | applicarlo a tutti gli handler |
| `useContext` | leggere valore condiviso | usarlo automaticamente per ogni stato |

## Liste, condizioni, valori derivati

```tsx
// Tipi, items e isLoading sono già definiti nel componente.
// Esempio del pattern di rendering (non un file autonomo).

if (isLoading) {
  return <p>Caricamento...</p>;
}

return (
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        {item.name}
      </li>
    ))}
  </ul>
);
```

**Regole fisse:** nomi dei componenti maiuscoli; Hook solo al top-level; `key` stabili; rendering puro; niente mutazioni dirette dello stato.

**Documentazione:** https://react.dev/learn
