<!-- level: Approfondimenti -->
<!-- summary: useMemo, ottimizzazione misurata, test React e accessibilità -->
# Performance, testing e accessibilità

**Idea:** ottimizza dopo aver misurato un problema concreto. `useMemo` e `useCallback` non sono necessari in ogni componente.

## 1. Prima: filtrare senza memorizzazione

```tsx
type Product = {
  id: string;
  name: string;
  price: number;
};

type CatalogProps = {
  items: Product[];
  query: string;
};

function Catalog(props: CatalogProps) {
  const normalizedQuery = props.query.toLowerCase();

  // filter restituisce un nuovo array. È spesso abbastanza veloce così.
  const filtered = props.items.filter((product) => {
    const normalizedName = product.name.toLowerCase();
    return normalizedName.includes(normalizedQuery);
  });

  return (
    <ul>
      {filtered.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

`filter` mantiene solo i prodotti per cui la callback restituisce `true`. Non serve un `useEffect` per questo dato derivato.

## 2. Solo se necessario: `useMemo`

```tsx
import { useMemo } from 'react';

function CatalogMemo(props: CatalogProps) {
  // useMemo memorizza il RISULTATO di questa funzione.
  // Il calcolo si ripete quando cambiano items oppure query.
  const filtered = useMemo(() => {
    const normalizedQuery = props.query.toLowerCase();

    return props.items.filter((product) => {
      return product.name.toLowerCase().includes(normalizedQuery);
    });
  }, [props.items, props.query]);

  return (
    <ul>
      {filtered.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

`[props.items, props.query]` è la **lista delle dipendenze**. L'ottimizzazione aiuta solo se il ricalcolo ha un costo reale o se stabilizzare il riferimento offre un beneficio misurabile.

## 3. Test che simulano l'esperienza dell'utente

*Esempio in un file separato `Catalog.test.tsx`: richiede Vitest e React Testing Library installati.*

```tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Catalog } from './Catalog';

test('mostra solo il prodotto cercato', () => {
  render(
    <Catalog
      items={[
        { id: '1', name: 'Mouse', price: 20 },
        { id: '2', name: 'Tastiera', price: 50 },
      ]}
      query="mou"
    />
  );

  // Cerchiamo ciò che l'utente vede, non lo stato interno.
  expect(screen.getByText('Mouse')).toBeTruthy();
  expect(screen.queryByText('Tastiera')).toBeNull();
});
```

**Nota:** per usare questo test, esporta `Catalog` con `export function Catalog` dal file `Catalog.tsx`. L'esempio presuppone che il test runner disponga di un ambiente DOM, come `jsdom`.

## 4. Accessibilità essenziale

- Usa `<button>` per azioni, `<a>` per navigazione, `<label htmlFor>` per campi.
- Gestisci il focus da tastiera; non usare `<div onClick>` come falso pulsante.
- Aggiungi `alt` alle immagini informative; usa `alt=""` per immagini decorative.
- Mostra gli errori in modo percepibile, ad esempio con `role="alert"` quando appropriato.

**Errore comune:** aggiungere `useMemo` e `useCallback` ovunque, rendendo il codice più complicato senza benefici misurabili.
