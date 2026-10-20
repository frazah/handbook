# Props, children e rendering condizionale

**Idea.** Le props sono argomenti del componente e sono **readonly**. `children` permette la composizione di UI; evita componenti giganti.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`props`**: argomenti forniti dal componente padre, da trattare come immutabili.
- **`key`**: identificatore stabile che aiuta React a distinguere gli elementi di una lista.

```tsx
// Il componente riceve dati e restituisce elementi dell’interfaccia.
import type { ReactNode } from 'react';

type PanelProps = { title: string; children: ReactNode };

function Panel({ title, children }: PanelProps) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function Stock({ count }: { count: number }) {
  return <span>{count > 0 ? `Disponibili: ${count}` : 'Esaurito'}</span>;
}

const products = [{ id: 'a', name: 'Libro' }, { id: 'b', name: 'Penna' }];

function ProductList() {
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

**Key:** deve identificare stabilmente l'elemento tra i render.  
Evita l'indice dell'array se la lista può essere riordinata, inserita o rimossa.

**Errore comune:** mutare `props` o modificare direttamente l'array dei dati ricevuti.
