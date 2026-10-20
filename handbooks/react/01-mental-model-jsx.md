<!-- level: Fondamenti -->
<!-- summary: Componenti come funzioni, JSX, props, className e rendering puro -->
# React, componenti e JSX

**Idea:** un componente è una funzione che descrive quale interfaccia mostrare. React si occupa di aggiornare il DOM quando dati e stato cambiano.

Prima leggi **`00a-come-leggere-tsx.md`**: spiega `type`, props e graffe `{...}`.

## 1. Un primo componente senza props

```tsx
// Il nome inizia con la maiuscola: React lo riconosce come componente.
function Greeting() {
  return (
    <h1>
      Ciao, benvenuto nel negozio!
    </h1>
  );
}
```

Un componente restituisce **JSX**: sintassi simile all'HTML che descrive elementi React.

## 2. Mostrare dati dentro JSX

```tsx
function ProductCard() {
  const name = 'Cuffie';
  const price = 49;

  return (
    <article className="card">
      {/* Le graffe indicano un'espressione JavaScript. */}
      <h2>{name}</h2>

      {/* toFixed(2) produce una stringa con due decimali. */}
      <p>{price.toFixed(2)} €</p>
    </article>
  );
}
```

**Attenzione:** `className` è il nome della prop React usata per le classi CSS. Nel DOM finale diventa `class`. In JSX i commenti interni al markup si scrivono `{/* ... */}`.

## 3. Comporre una pagina con componenti

```tsx
function App() {
  return (
    <main>
      <h1>Catalogo</h1>

      {/* Questo è un componente scritto da noi. */}
      <ProductCard />
    </main>
  );
}

export default App;
```

**`export default`** permette ad altri file di importare `App` come esportazione principale del modulo.

## 4. Regole importanti del JSX

- Usa `className` invece di `class` e `htmlFor` invece di `for`.
- I nomi degli eventi sono camelCase: `onClick`, `onChange`.
- Tag senza figli si chiudono: `<input />`, `<img />`.
- Ogni `return` deve avere un singolo nodo radice; usa `<>...</>` se non vuoi un wrapper HTML.
- Il **render deve essere puro**: niente chiamate `fetch`, scritture di stato o modifiche dirette al DOM al suo interno.

```tsx
function ProductDetails() {
  return (
    <> {/* Fragment: raggruppa senza aggiungere un div al DOM. */}
      <h2>Dettagli prodotto</h2>
      <p>Disponibile online</p>
    </>
  );
}
```

**Da ricordare:** prima comprendi il componente come funzione normale, poi aggiungi props, stato ed eventi nei capitoli successivi.
