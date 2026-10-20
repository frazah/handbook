# React, componenti e JSX

**Idea.** React descrive **cosa** mostrare in funzione di props e stato; non scrivi imperativamente `document.createElement` per ogni modifica.
Il componente è una funzione che restituisce JSX.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.

```tsx
// Il componente riceve dati e restituisce elementi dell’interfaccia.
type Product = { id: number; name: string; price: number };

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <h3>{product.name}</h3>
      <strong>{product.price.toFixed(2)} €</strong>
    </article>
  );
}
export default function App() {
  return <main><ProductCard product={{ id: 1, name: 'Cuffie', price: 49 }} /></main>;
}
```

**JSX non è HTML puro:** usa `className`, `htmlFor`, eventi camelCase, tag chiusi (`<img />`), un solo root o fragment (`<>...</>`).

**Regola:** componenti con iniziale maiuscola (`ProductCard`); tag HTML minuscoli (`div`).  
Il rendering dev'essere puro: niente chiamate API o modifiche DOM al suo interno.
