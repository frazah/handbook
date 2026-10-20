# React — Cheatsheet rapida

| Obiettivo | Pattern |
|---|---|
| Componente | `function Card({title}: {title: string}) { return <h2>{title}</h2> }` |
| Stato | `const [value, setValue] = useState('')` |
| Update prev | `setCount(n => n + 1)` |
| Lista | `items.map(x => <li key={x.id}>{x.name}</li>)` |
| Condizione | `{loading ? <Spinner /> : <List />}` |
| Evento | `onClick={() => save()}` |
| Form | `<input value={value} onChange={e => setValue(e.target.value)} />` |
| Effect | `useEffect(() => { /* sync */ return cleanup }, [dep])` |
| Stato complesso | `useReducer(reducer, initial)` |
| Condiviso | `createContext`, `useContext` |

**Da ricordare:** state immutabile, key stabili, rendering puro, niente Effect per dati derivati.  
Hook soltanto in top-level componenti/custom hook.

**Docs:** https://react.dev/learn

---

## JSX, props e render: sintassi pronta

```tsx
// Props: dati immutabili ricevuti dal componente padre.
type ProductCardProps = { title: string; price: number; onBuy: () => void };

function ProductCard({ title, price, onBuy }: ProductCardProps) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{price} €</p>
      <button onClick={onBuy}>Acquista</button>
    </article>
  );
}
```

| Caso | Pattern |
|---|---|
| Condizione | `{loading ? <Spinner /> : <Content />}` |
| Condizione opzionale | `{error && <p>{error}</p>}` (usa boolean reale) |
| Liste | `{items.map(item => <li key={item.id}>{item.name}</li>)}` |
| Frammento | `<>...</>` senza elemento wrapper |
| Classi | `className="card"` |
| Styles inline | `style={{ padding: 8 }}` |
| Callback | `onClick={() => remove(item.id)}` |
| Prop opzionale | `type Props = { subtitle?: string }` |
| Figli | `children: React.ReactNode` |

## Stato e aggiornamenti corretti

*I pattern seguenti sono frammenti da usare dentro un componente che ha dichiarato `id` e `setTasks`.*

```tsx
// Un setter basato sul precedente stato evita valori obsoleti.
const [count, setCount] = useState(0);
setCount(previous => previous + 1);

// Un array va sostituito, non mutato direttamente.
setTasks(old => old.map(t => t.id === id ? { ...t, done: true } : t));
setTasks(old => old.filter(t => t.id !== id));

// Un input controllato riceve sempre value e onChange.
const [query, setQuery] = useState('');
// <input value={query} onChange={e => setQuery(e.target.value)} />
```

## Hook e gestione degli effetti

| Hook | Scopo | Nota |
|---|---|---|
| `useState(initial)` | stato locale | setter immutabile |
| `useReducer(reducer, initial)` | stato a transizioni complesse | azioni descrittive |
| `useEffect(setup, [deps])` | sincronizzazione con sistema esterno | cleanup `return () => ...` |
| `useRef(initial)` | valore mutabile o riferimento DOM | non forza render |
| `useMemo(() => calc(), [deps])` | memorizza un calcolo | ottimizzazione, non stato |
| `useCallback(fn, [deps])` | mantiene identità funzione | non sempre necessario |
| `useContext(Context)` | legge valore condiviso | richiede provider appropriato |
| `useId()` | ID stabili per accessibilità | non usarli come key delle liste |

```tsx
// Esempio: cancellare la richiesta quando il componente si smonta.
useEffect(() => {
  const controller = new AbortController();
  void fetch('/api/tasks', { signal: controller.signal });
  return () => controller.abort(); // cleanup
}, []);
```

**Attenzione:** chiamare gli Hook solo al livello superiore di componenti o custom Hook, non dentro condizioni o cicli.  
Calcola i valori derivati durante il render, senza duplicarli nello stato.
