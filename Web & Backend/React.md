# React + TypeScript

> Libreria per costruire interfacce come composizione di **componenti**: funzioni che ricevono dati e restituiscono la UI da mostrare.
> Prerequisiti: [JavaScript](../Languages/JavaScript.md) · [TypeScript](../Languages/TypeScript.md) · Collegate: [Vue](Vue.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md) · [Recipe React + FastAPI](../Recipes/React%20%2B%20FastAPI.md)

## Modello mentale

- **UI = f(stato).** Non modifichi il DOM a mano: descrivi come deve apparire la UI per un dato stato, e React aggiorna il DOM di conseguenza.
- Un componente si **ri-renderizza** quando cambia il suo stato, quando si ri-renderizza il genitore o quando cambia un context che usa. "Render" significa solo chiamare di nuovo la funzione.
- Ogni aggiornamento ha due fasi: **render** (calcola il nuovo albero, deve essere puro) e **commit** (applica al DOM solo le differenze). Il confronto tra albero vecchio e nuovo si chiama **reconciliation**.
- Lo **stato è immutabile**: crei sempre un nuovo oggetto o array. React confronta i riferimenti con `Object.is`: se il riferimento non cambia, non ri-renderizza.
- Gli aggiornamenti di stato sono **pianificati e raggruppati** (batching): dopo `setX`, la variabile `x` nel render corrente non cambia.
- I dati scendono tramite le **props**; gli eventi salgono tramite le **callback**. Lo stato condiviso si sposta nel primo antenato comune (*lifting state up*).
- Gli **effetti** servono a sincronizzarsi con sistemi *esterni* (rete, timer, DOM, sottoscrizioni), non a calcolare dati derivati.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Componente | `function ProductCard({ product }: Props) { return <div>…</div> }` |
| Espressione in JSX | `{product.name}` · `{(cents / 100).toFixed(2)}` |
| Attributi | `className="card"` · `style={{ color: "red" }}` · `htmlFor` |
| Condizionale | `{isLoading ? <Spinner /> : <List />}` · `{error && <Alert />}` |
| Lista | `{items.map((i) => <Row key={i.id} item={i} />)}` |
| Evento | `onClick={() => addToCart(product.id)}` |
| Frammento | `<>…</>` (più elementi senza un `div` extra) |
| Stato | `const [qty, setQty] = useState(1)` |
| Aggiornamento funzionale | `setQty((q) => q + 1)` |
| Children | `({ children }: { children: React.ReactNode })` |

**Attenzione:** `{count && <Badge />}` con `count === 0` mostra "0". Scrivi `{count > 0 && <Badge />}`.

## Componenti, props e state

```tsx
import { useState } from "react";

type Product = { id: number; name: string; priceCents: number };

type ProductCardProps = {
  product: Product;
  onAdd: (productId: number, quantity: number) => void; // l'evento sale al genitore
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1); // stato locale: riguarda solo questa card

  return (
    <article>
      <h3>{product.name}</h3>
      <p>{(product.priceCents / 100).toFixed(2)} €</p>
      <input type="number" min={1} value={quantity}
             onChange={(e) => setQuantity(Number(e.target.value))} />
      <button onClick={() => onAdd(product.id, quantity)}>Aggiungi</button>
    </article>
  );
}
```

L'input è **controllato**: il suo valore viene dallo stato e ogni modifica passa da `setQuantity`. Un input **non controllato** tiene il valore nel DOM e lo leggi con un `ref` o con `FormData`, utile per form semplici.

### Aggiornare stato immutabile

```tsx
// dentro un componente (es. CartPage)
type CartItem = { productId: number; quantity: number };
const [cart, setCart] = useState<CartItem[]>([]);

function addToCart(productId: number, quantity: number) {
  setCart((current) => {  // forma funzionale: parte sempre dallo stato più recente
    const existing = current.find((i) => i.productId === productId);
    return existing
      ? current.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i)
      : [...current, { productId, quantity }];
  });
}
// SBAGLIATO: cart.push(...) + setCart(cart) -> stesso riferimento, nessun re-render
```

**Stato derivato:** non metterlo nello stato. Il totale del carrello si calcola durante il render: `const total = cart.reduce(...)`. Duplicarlo nello stato crea dati non sincronizzati.

## Liste e key

La `key` dice a React quale elemento è quale tra un render e l'altro. Deve essere **stabile e unica tra fratelli**: usa l'id del dato. Con l'indice dell'array, riordinare o inserire elementi associa lo stato interno (input, focus) all'elemento sbagliato.

## Hook

**Regole:** chiamali solo al livello più alto di un componente o di un custom hook, mai dentro condizioni o cicli. React associa lo stato agli hook in base all'**ordine di chiamata**.

| Hook | Serve a |
|---|---|
| `useState` | stato locale |
| `useReducer` | stato con molte transizioni (`dispatch({ type: "add", ... })`) |
| `useEffect` | sincronizzarsi con sistemi esterni dopo il commit |
| `useRef` | valore mutabile che non causa re-render; riferimento a un nodo DOM |
| `useMemo` | memorizzare un calcolo costoso tra i render |
| `useCallback` | memorizzare una funzione (stesso riferimento tra i render) |
| `useContext` | leggere un valore fornito da un antenato |
| `useId` | id stabili per l'accessibilità (`htmlFor`) |

### useEffect e caricamento dati

```tsx
import { useEffect, useState } from "react";

type Order = { id: number; status: string; totalCents: number };

function useOrders(status: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/orders?status=${status}`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(setOrders)
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); });

    // Cleanup: annulla la richiesta se `status` cambia prima della risposta (race condition)
    // o se il componente viene smontato.
    return () => controller.abort();
  }, [status]); // ri-esegue solo quando cambia `status`

  return { orders, error };
}
```

- **Dipendenze:** ogni valore reattivo usato nell'effetto va nell'array. Mancarne uno produce dati vecchi (*stale closure*); `[]` = solo al mount.
- **Non serve un effetto** per: calcolare dati derivati (fallo nel render), reagire a un click (fallo nell'handler), resettare lo stato al cambio di una prop (usa `key`).
- In produzione si usa una libreria di data fetching (**TanStack Query**, SWR) o il framework (Next.js): cache, deduplica, retry e refetch senza riscriverli a mano.

### Custom hook

Una funzione `useQualcosa` che compone altri hook per **riusare logica con stato** (non lo stato stesso: ogni componente che la chiama ha la propria copia). `useOrders` sopra ne è un esempio.

## Context

Passa un valore a tutto un sottoalbero senza *prop drilling*. Ogni componente che lo legge si ri-renderizza quando il valore cambia: adatto a dati che cambiano di rado (tema, utente, lingua), non a stato ad alta frequenza.

```tsx
import { createContext, useContext } from "react";

type CartContextValue = { count: number; add: (productId: number) => void };
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart va usato dentro <CartProvider>"); // errore chiaro invece di null
  return ctx;
}
```

## Performance

- Prima **misura** con React DevTools Profiler. La maggior parte dei re-render è economica.
- `React.memo(Component)` salta il render se le props sono uguali per riferimento. Ha senso solo se il genitore passa props stabili: oggetti e funzioni creati nel render cambiano ogni volta, ed è lì che servono `useMemo` e `useCallback`.
- Sposta lo stato **in basso**, vicino a chi lo usa, così cambiandolo si ri-renderizza meno albero.
- Liste molto lunghe: **virtualizzazione** (TanStack Virtual). Codice pesante: `React.lazy` + `<Suspense>` per lo split del bundle.
- Il **React Compiler** (React 19) applica la memoization automaticamente, riducendo la necessità di `useMemo`/`useCallback`.

## Error boundary, Suspense e StrictMode

- **Error boundary:** un componente (ancora una classe, o `react-error-boundary`) che cattura gli errori di render dei figli e mostra un fallback. Non cattura gli errori negli event handler né nel codice async.
- **Suspense:** mostra un fallback mentre un figlio "attende" (codice caricato con `lazy`, dati con librerie compatibili o `use`).
- **StrictMode** (solo in sviluppo) esegue due volte render ed effetti per far emergere effetti impuri e cleanup mancanti. Se la tua fetch parte due volte in sviluppo, è voluto.

## React 19 in breve

- **Actions:** funzioni async passate a `<form action={...}>`, con `useActionState` (stato e pending) e `useOptimistic` (UI ottimistica).
- **`use(promise)`** legge una Promise dentro il render, integrandosi con Suspense.
- **Server Components** (in framework come Next.js): componenti eseguiti sul server, senza JS inviato al client, che possono leggere direttamente dal database. Quelli interattivi si marcano con `"use client"`.
- `ref` si passa come prop normale; `forwardRef` non serve più.

## Testing

**React Testing Library** testa ciò che vede l'utente, non i dettagli interni.

```tsx
// illustrativo: richiede vitest/jest + @testing-library/react + user-event
test("aggiunge un prodotto al carrello", async () => {
  const onAdd = vi.fn();
  render(<ProductCard product={{ id: 1, name: "Tazza", priceCents: 1299 }} onAdd={onAdd} />);

  await userEvent.click(screen.getByRole("button", { name: "Aggiungi" }));

  expect(onAdd).toHaveBeenCalledWith(1, 1);
});
```

## Domande da colloquio

**Base**
- **Props vs state?** Le props arrivano dal genitore e sono in sola lettura; lo state è locale al componente e cambiandolo si causa un re-render.
- **Perché servono le key?** Permettono alla reconciliation di riconoscere quale elemento è quale tra un render e l'altro. Con l'indice come key, riordinare la lista confonde lo stato degli elementi.
- **Componente controllato vs non controllato?** Nel controllato il valore vive nello stato React (validazione immediata, unica fonte di verità); nel non controllato vive nel DOM e lo leggi quando serve.
- **Cos'è il virtual DOM?** La rappresentazione in memoria della UI: React confronta la nuova con la precedente e applica al DOM reale solo le differenze.
- **React è una libreria o un framework?** Una libreria per la UI: routing, data fetching e build sono scelte separate (o le fornisce un framework come Next.js).
- **Cos'è il prop drilling e come lo eviti?** Passare props attraverso molti livelli che non le usano. Si risolve con la composizione (`children`), con il Context o con uno store.

**Intermedio**
- **Perché `setCount(count + 1)` due volte incrementa di 1?** Entrambe le chiamate leggono lo stesso `count` del render corrente. Con `setCount((c) => c + 1)` ogni aggiornamento parte dal valore precedente.
- **Quando si ri-renderizza un componente?** Quando cambia il suo stato, quando si ri-renderizza il genitore o quando cambia un context letto. Le props uguali non bastano a evitarlo senza `memo`.
- **A cosa serve il cleanup di `useEffect`?** Annulla ciò che l'effetto ha avviato (richieste, sottoscrizioni, timer) prima del prossimo effetto e allo smontaggio. Evita leak e race condition.
- **`useMemo` vs `useCallback`?** `useMemo` memorizza il risultato di un calcolo, `useCallback` una funzione. Servono per calcoli costosi o per passare riferimenti stabili a componenti memoizzati.
- **Perché le regole degli hook?** React identifica lo stato di ogni hook in base all'ordine di chiamata: chiamarli in modo condizionale sposterebbe gli stati tra un render e l'altro.
- **Come si mappano i lifecycle delle classi sugli hook?** `componentDidMount` → `useEffect(…, [])`; `componentDidUpdate` → `useEffect` con dipendenze; `componentWillUnmount` → la funzione di cleanup dell'effetto.
- **`useState` o `useReducer`?** `useReducer` quando lo stato ha molte transizioni o campi che cambiano insieme: la logica sta in un reducer puro e testabile, e i componenti inviano azioni.

**Avanzato**
- **Context vs state manager (Redux, Zustand)?** Context è un meccanismo di *trasporto*: ogni consumer si ri-renderizza a ogni cambio. Gli store esterni permettono sottoscrizioni a porzioni di stato e strumenti di debug. Per lo stato del server si usa una data library.
- **Cos'è una stale closure?** Una funzione (effetto, callback, timer) che ha catturato i valori di un render precedente. Si risolve con le dipendenze corrette, con gli aggiornamenti funzionali o con un `ref`.
- **Server vs Client Components?** I Server Components girano solo sul server, non aggiungono JS al bundle e possono accedere direttamente ai dati; i Client Components gestiscono stato ed eventi nel browser.
- **Perché StrictMode esegue gli effetti due volte?** Per verificare che ogni effetto abbia un cleanup corretto: un componente deve sopravvivere a mount → unmount → mount.

## Approfondisci

- [react.dev — Learn](https://react.dev/learn) · [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [TanStack Query](https://tanstack.com/query/latest) · [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
