<!-- level: Fondamenti -->
<!-- summary: Props, children, ReactNode, composizione, condizioni e liste con key -->
# Props, `children` e liste

**Idea:** le **props** sono dati che un componente genitore passa a un componente figlio. Il figlio le legge, ma non le modifica.

## 1. Props: iniziamo senza destructuring

```tsx
// Definiamo il tipo PRIMA della funzione.
type StockProps = {
  count: number;
};

function Stock(props: StockProps) {
  // Separiamo la logica dalla visualizzazione.
  const label = props.count > 0
    ? `Disponibili: ${props.count}`
    : 'Esaurito';

  return (
    <span>{label}</span>
  );
}

function App() {
  return (
    <Stock count={5} />
  );
}
```

`? :` è l'**operatore ternario** di JavaScript: `condizione ? seVero : seFalso`. Le graffe in `count={5}` passano il numero `5`, non la stringa `'5'`.

**Attenzione:** la forma compatta `function Stock({ count }: { count: number })` è valida, ma qui la evitiamo: mescola destructuring e tipo inline nella stessa riga.

## 2. Destructuring: la stessa cosa, solo dopo averla capita

```tsx
type StockProps = {
  count: number;
};

function Stock({ count }: StockProps) {
  return (
    <span>
      {count > 0 ? `Disponibili: ${count}` : 'Esaurito'}
    </span>
  );
}
```

`{ count }` estrae la proprietà dall'oggetto props. `: StockProps` annota **il tipo dell'oggetto intero**, non di `count` soltanto.

## 3. `children`: il contenuto tra i tag

`ReactNode` è un tipo React che comprende testo, numeri, elementi JSX, array di elementi e altri valori renderizzabili.

```tsx
import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel(props: PanelProps) {
  return (
    <section className="panel">
      <h2>{props.title}</h2>

      {/* Qui appare ciò che il genitore ha inserito nei tag Panel. */}
      {props.children}
    </section>
  );
}

function App() {
  return (
    <Panel title="Catalogo">
      <p>Prodotti selezionati per te</p>
      <Stock count={5} />
    </Panel>
  );
}
```

**Da ricordare:** `children` non è una parola riservata TypeScript: è una prop usata da React per passare contenuti annidati.

## 4. Liste: `map()` e `key`

```tsx
// Il tipo descrive un singolo elemento dell'array.
type Product = {
  id: string;
  name: string;
};

const products: Product[] = [
  { id: 'a', name: 'Libro' },
  { id: 'b', name: 'Penna' },
];

function ProductList() {
  return (
    <ul>
      {/* map() crea un elemento JSX per ogni prodotto. */}
      {products.map((product) => (
        <li key={product.id}>
          {product.name}
        </li>
      ))}
    </ul>
  );
}
```

- `.map(...)` trasforma ogni oggetto nell'elemento JSX corrispondente.
- `product => (...)` è una **arrow function**: `product` è il parametro.
- `key={product.id}` consente a React di distinguere gli elementi durante inserimenti, rimozioni e riordini.

**Attenzione:** la `key` deve essere stabile e unica tra i fratelli della lista. Evita l'indice dell'array se l'elenco può cambiare ordine.

## 5. Rendere contenuti in modo condizionale

```tsx
type MessageProps = {
  hasError: boolean;
};

function Message(props: MessageProps) {
  // Un ramo per ciascun caso rende chiaro il comportamento.
  if (props.hasError) {
    return <p role="alert">Qualcosa è andato storto.</p>;
  }

  return <p>Operazione riuscita.</p>;
}
```

**Errore comune:** modificare direttamente `props.products` con `push` o `sort`: tratta le props come immutabili.
