<!-- level: Fondamenti -->
<!-- summary: Guida graduale a JSX, props, destructuring, annotazioni TypeScript e callback -->
# Prima di React: come leggere un file `.tsx`

Questa lezione viene **prima** dei componenti avanzati. Una riga React può mescolare JavaScript, TypeScript e JSX: impara a riconoscerli separatamente.

## 1. Tre linguaggi visivi nello stesso file

- **JavaScript:** funzioni, oggetti, array, `if`, `map`, `=>`.
- **TypeScript:** annotazioni come `: string`, `type Props`, `() => void`. Servono al controllo statico; non diventano istruzioni JavaScript a runtime.
- **JSX:** `<button>...</button>`, `{expression}` dentro i tag. Descrive l'interfaccia.

```tsx
// JavaScript: una funzione che produce una stringa.
function greet(name: string): string {
  // TypeScript: le annotazioni ": string" descrivono i tipi.
  return `Ciao, ${name}`;
}

// JSX: le graffe inseriscono un'ESPRESSIONE JavaScript nel markup.
function Welcome() {
  const message = greet('Ada');

  return (
    <h1>{message}</h1>
  );
}
```

**Attenzione:** le graffe di JSX in `{message}` **non** sono le stesse graffe degli oggetti JavaScript o del destructuring. Il loro significato dipende dal contesto.

## 2. Props senza destructuring: il caso più leggibile

Le **props** sono un oggetto fornito dal componente genitore. Prima di abbreviare, usiamolo per intero.

```tsx
// Definiamo la forma dell'oggetto props.
type PriceLabelProps = {
  price: number;
};

function PriceLabel(props: PriceLabelProps) {
  return (
    <strong>
      {props.price} €
    </strong>
  );
}

// Uso nel genitore: tra {} passiamo un numero, non una stringa.
function App() {
  return <PriceLabel price={29} />;
}
```

In `PriceLabel(props: PriceLabelProps)`, `props` è **il valore** e `PriceLabelProps` è **il tipo**.

## 3. Destructuring: una scorciatoia JavaScript, non una magia React

```ts
const product = {
  name: 'Mouse',
  price: 29,
};

// Sintassi estesa: leggiamo le due proprietà.
const name1 = product.name;
const price1 = product.price;

// Equivalente: destrutturiamo l'oggetto.
const { name, price } = product;
```

Applicato alle props:

```tsx
type PriceLabelProps = {
  price: number;
};

// PRIMA: facile da leggere.
function PriceLabelA(props: PriceLabelProps) {
  return <strong>{props.price} €</strong>;
}

// DOPO: stessa logica, con destructuring.
function PriceLabelB({ price }: PriceLabelProps) {
  return <strong>{price} €</strong>;
}
```

La parte **a sinistra dei due punti** (`{ price }`) è JavaScript; la parte a destra (`PriceLabelProps`) è TypeScript.

## 4. Callback: passare una funzione come dato

Una **callback** è una funzione che qualcun altro chiamerà successivamente, ad esempio al click.

```ts
// Questo descrive un TIPO di funzione, non l'esegue.
// Riceve title: string e non richiede un valore di ritorno utilizzabile.
type SaveCallback = (title: string) => void;

// Questa invece è una FUNZIONE vera e propria.
function saveToConsole(title: string): void {
  console.log('Salvato:', title);
}

// La variabile contiene un riferimento alla funzione.
const onSave: SaveCallback = saveToConsole;
```

Ora nella pratica React:

```tsx
type AddButtonProps = {
  onAdd: (title: string) => void;
};

function AddButton(props: AddButtonProps) {
  // handleClick viene eseguita SOLO in risposta al click.
  function handleClick(): void {
    props.onAdd('Comprare il latte');
  }

  return (
    <button onClick={handleClick}>
      Aggiungi task
    </button>
  );
}
```

**Attenzione:** `onClick={handleClick}` passa la funzione, mentre `onClick={handleClick()}` la *esegue durante il render* (quasi sempre un errore).

## 5. Perché evitiamo la firma compressa

```tsx
// Possibile, ma poco didattico:
// function AddTask({ onAdd }: { onAdd: (title: string) => void }) { ... }

// Preferita per studiare:
type AddTaskProps = {
  onAdd: (title: string) => void;
};

function AddTask(props: AddTaskProps) {
  return <button onClick={() => props.onAdd('Task')}>Aggiungi</button>;
}
```

**Percorso consigliato:** leggi prima `props.nome`, poi prova `{ nome }: NomeProps` quando ti è naturale.

## 6. Mini glossario di simboli

| Sintassi | Da leggere come |
|---|---|
| `title: string` | campo `title` con tipo stringa |
| `title?: string` | campo facoltativo |
| `: Props` | annotazione del tipo del parametro |
| `{ title }` in una funzione | destructuring dell'oggetto |
| `{title}` dentro JSX | espressione JavaScript visualizzata |
| `onClick={handler}` | passa una funzione all'evento |
| `onClick={() => handler(3)}` | crea una callback che passerà `3` al click |
| `(value: string) => void` | tipo di funzione: input stringa, ritorno non usato |
| `items.map(item => ...)` | trasforma ogni elemento in un altro valore |
| `<Component />` | usa un componente, non un elemento HTML nativo |

**Controllo:** prima di proseguire, prova a spiegare a voce cosa sono `props`, `type`, `{...}` nel JSX e `onClick`.
