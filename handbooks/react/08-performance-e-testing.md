# Performance, test e a11y

**Idea.** Ottimizza solo quando misuri un problema reale. `useMemo` evita calcoli costosi ripetuti, `useCallback` stabilizza riferimenti; non servono per ogni variabile o handler.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`useMemo` / `useCallback`**: strumenti per memorizzare un calcolo o l’identità di una funzione quando serve.
- **`key`**: identificatore stabile che aiuta React a distinguere gli elementi di una lista.

```tsx
import { useMemo } from 'react';
type Product = { id: string; name: string; price: number };
function Catalog({ items, query }: { items: Product[]; query: string }) {
  // filter mantiene soltanto gli elementi per cui la condizione è vera.
  const filtered = useMemo(() => items.filter(x =>
    x.name.toLowerCase().includes(query.toLowerCase())
  ), [items, query]);
  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

## Test orientati all'utente

```tsx
// Vitest + React Testing Library (dipendenze da installare)
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
test('mostra il prodotto', () => {
  render(<Catalog items={[{id:'1', name:'Mouse', price:20}]} query="mou" />);
  expect(screen.getByText('Mouse')).toBeTruthy();
});
```

**A11y:** HTML semantico, `label` associati agli input, pulsanti veri, testo alternativo per immagini, focus da tastiera; evita `onClick` su `div` come sostituto di `<button>`.

**Errore comune:** ottimizzare con `useMemo` senza misurare, aumentando complessità e dipendenze.
