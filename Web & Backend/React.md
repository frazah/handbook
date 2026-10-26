# React + TypeScript — Cheatsheet

> **Quando serve:** costruire UI tramite componenti, gestire stato, form, liste e richieste API. Se TypeScript ti confonde, guarda prima [TypeScript](../Languages/TypeScript.md).

Un componente React è una funzione che **descrive la UI** in JSX. Le **props** sono dati ricevuti dal genitore; lo **state** appartiene al componente e, quando cambia, React pianifica un nuovo render. I componenti devono essere puri durante il rendering: niente effetti collaterali o callback invocate lì.

## Sintassi al volo

| Vuoi fare | Sintassi / idea |
|---|---|
| JS nel JSX | `<h2>{name}</h2>` |
| Classe CSS | `className="card"` |
| Prop | `<Card title="Ciao" />` |
| Children | `<Card>Testo</Card>` |
| Condizione | `{ready ? <List /> : <p>Loading</p>}` |
| Lista | `items.map(item => <li key={item.id}>...</li>)` |
| Evento | `onClick={handleClick}` (non `handleClick()`) |
| State | `const [n, setN] = useState(0)` |
| Fragment | `<>...</>` |
| Effect | `useEffect(() => { ... }, [dependency])` |

## Concetti applicati

### Props + children, senza tipi compressi

```tsx
import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  children: ReactNode; // Elementi o testo inseriti tra <Panel> e </Panel>
};

function Panel(props: PanelProps) {
  return (
    <section className="panel">
      <h2>{props.title}</h2>
      {props.children}
    </section>
  );
}

// Utilizzo:
// <Panel title="Prodotti"><p>Disponibili oggi</p></Panel>
```

### State ed eventi

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';

type CartItemProps = {
  initialQuantity: number;
};

function CartQuantity(props: CartItemProps) {
  // Lo state conserva la quantità mostrata nell'interfaccia.
  const [quantity, setQuantity] = useState(props.initialQuantity);

  function handleIncrement() {
    // Il nuovo valore dipende dal precedente, quindi usa la callback.
    setQuantity((previous) => previous + 1);
  }

  return (
    <button onClick={handleIncrement}>
      Quantità nel carrello: {quantity}
    </button>
  );
}
```

### Callback: il figlio comunica al genitore

```tsx
// È il TIPO di una funzione: accetta una stringa, non richiede un risultato.
type OnAddTask = (title: string) => void;

type AddTaskProps = {
  onAdd: OnAddTask;
};

function AddTask(props: AddTaskProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Non ricaricare la pagina.
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    // La callback informa il componente genitore della nuova task.
    props.onAdd(cleanTitle);
    setTitle(''); // Svuota il campo dopo l'invio.
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="Titolo task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit">Aggiungi task</button>
    </form>
  );
}

type Task = { id: string; title: string };

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  function handleAddTask(title: string) {
    // UUID è stabile tra i render: evita l'indice come key della lista.
    const newTask = { id: crypto.randomUUID(), title };
    setTasks((previous) => [...previous, newTask]);
  }

  return (
    <section>
      <AddTask onAdd={handleAddTask} />
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </section>
  );
}
```

### Liste e form controllati

```tsx
type ProductSummary = { id: string; name: string };

type CatalogProps = {
  products: ProductSummary[]; // Arrivano dal genitore o da un'API.
};

function ProductCatalog(props: CatalogProps) {
  const [query, setQuery] = useState('');

  // Deriviamo la lista dallo state: non serve duplicarla in un secondo state.
  const filtered = props.products.filter((product) =>
    product.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section>
      <label htmlFor="product-search">Cerca nel catalogo</label>
      <input
        id="product-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul>
        {filtered.map((product) => (
          // `key` deve restare stabile mentre filtri o riordini la lista.
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </section>
  );
}
```

---

### Caricare dati da API con un effect

```tsx
import { useEffect, useState } from 'react';

type Product = { id: string; name: string };

function RemoteProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AbortController evita di usare risultati di richieste ormai obsolete.
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Product[] = await response.json(); // assumiamo API attendibile
        setProducts(data);
      } catch (caught) {
        if (!controller.signal.aborted) setError(String(caught));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort(); // cleanup dell'effect
  }, []);

  if (loading) return <p>Caricamento prodotti…</p>;
  if (error) return <p role="alert">{error}</p>;
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

**Attenzione:** il tipo `Product[]` non valida il JSON a runtime. Nelle app più grandi usa una libreria dati/cache o una strategia framework quando appropriato. `useEffect` serve a sincronizzarsi con sistemi esterni, non a calcolare ogni valore derivabile dalle props.

### Altri hook e quando servono

`useRef` conserva una cella mutabile fra render senza causare un nuovo render quando cambia. `useContext` condivide un valore con discendenti senza passarne manualmente la prop attraverso ogni livello. `useReducer` concentra transizioni complesse di stato in una funzione pura.

```tsx
import { createContext, useContext, useReducer, useRef } from 'react';

type CartAction =
  | { type: 'add'; productId: string }
  | { type: 'clear' };

type CartState = { productIds: string[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
      return { productIds: [...state.productIds, action.productId] };
    case 'clear':
      return { productIds: [] };
  }
}

const CurrencyContext = createContext('EUR');

function CheckoutToolbar() {
  const currency = useContext(CurrencyContext);
  const [cart, dispatch] = useReducer(cartReducer, { productIds: [] });
  const searchInput = useRef<HTMLInputElement>(null);

  function focusSearch() {
    searchInput.current?.focus(); // `current` può essere null.
  }

  return (
    <section>
      <input ref={searchInput} aria-label="Cerca prodotti" />
      <button onClick={focusSearch}>Cerca</button>
      <button onClick={() => dispatch({ type: 'add', productId: 'book-1' })}>
        Aggiungi ({cart.productIds.length})
      </button>
      <p>Valuta: {currency}</p>
    </section>
  );
}
```

**Custom hook** = normale funzione che usa hook per riutilizzare comportamento; deve iniziare per `use`. Gli hook si chiamano **sempre al livello superiore** di un componente o custom hook, non dentro `if`, cicli o handler.

```tsx
import { useEffect, useState } from 'react';

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    function updateStatus() {
      setOnline(navigator.onLine);
    }

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return online;
}
```

Il hook sopra è **solo client-side**: con rendering lato server `navigator` non è disponibile, quindi occorre un valore iniziale sicuro lato server. In un'app prova le interazioni con React Testing Library e test user-centric. Per performance, usa prima il Profiler: `memo`, `useMemo` e `useCallback` non sono ottimizzazioni da applicare ovunque.

**Cosa succede al render?** React richiama i componenti per calcolare la UI desiderata, confronta le nuove descrizioni (*reconciliation*) e applica al DOM le modifiche necessarie. Una `key` stabile preserva l'identità degli elementi; lo state è uno **snapshot** del render corrente. In sviluppo Strict Mode può rieseguire render/effect per trovare effetti non gestiti: non è un motivo per disattivarlo. Approfondisci: [React: rendering](https://react.dev/learn/render-and-commit), [state as a snapshot](https://react.dev/learn/state-as-a-snapshot), [rules of hooks](https://react.dev/reference/rules/rules-of-hooks).

## Domande da colloquio

**Props vs state?** Props arrivano dall'esterno; state è memoria del componente che può cambiare nel tempo.

**Perché una `key`?** Mantiene l'identità degli elementi di una lista durante il confronto tra render.

**Controlled input?** Il valore è guidato dallo state React e aggiornato con un handler.

**Perché aggiornare lo state senza mutarlo?** React si basa su nuovi valori/riferimenti per rilevare modifiche e mantenere render prevedibili.

**`useEffect` vs event handler?** Effect per sincronizzazioni post-render con sistemi esterni; handler per azioni causate da eventi dell'utente.

**Approfondisci quando serve:** [React — Thinking in React](https://react.dev/learn/thinking-in-react) (props/state, confini dei componenti), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects). Il fetch mostrato è una base: app reali gestiscono cache e validazione runtime dei payload.
