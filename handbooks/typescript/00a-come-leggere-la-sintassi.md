<!-- level: Fondamenti -->
<!-- summary: Leggere due punti, generics, callback, union, destructuring e arrow function senza confondersi -->
# Prima di tutto: come leggere la sintassi TypeScript

TypeScript aggiunge **informazioni sui tipi** alla sintassi JavaScript. Il difficile all'inizio è distinguere ciò che *descrive un tipo* da ciò che *viene eseguito*.

## 1. `:` può avere significati diversi

```ts
// Oggetto JavaScript: : associa una chiave a un VALORE.
const product = {
  price: 20,
};

// TypeScript: : associa un parametro a un TIPO.
function double(price: number): number {
  return price * 2;
}
```

Nel primo esempio `price: 20` è un valore reale dell'oggetto. Nel secondo `price: number` è un'annotazione che TypeScript rimuove nella compilazione.

## 2. Separare i tipi delle props dall'implementazione

```tsx
// Descrizione dei dati accettati dal componente.
type StockProps = {
  count: number;
};

// Il parametro "props" ha il tipo StockProps.
function Stock(props: StockProps) {
  return <span>{props.count}</span>;
}
```

**Evitiamo per iniziare** `function Stock({ count }: { count: number })`: è corretta, ma comprime due sintassi nella stessa posizione.

## 3. `=>` può descrivere una funzione oppure crearne una

```ts
// TIPO: la funzione deve ricevere una stringa e non richiede un risultato usabile.
type SaveHandler = (title: string) => void;

// VALORE: questa arrow function esiste davvero e può essere eseguita.
const save: SaveHandler = (title) => {
  console.log('Salvato:', title);
};

// Chiamata: ora eseguiamo la funzione.
save('Studiare TypeScript');
```

Nel primo caso dopo `=>` compare il **tipo di ritorno** (`void`). Nel secondo dopo `=>` compare il **corpo della funzione** (`{ ... }`).

## 4. `<T>` significa «un tipo che ancora non conosco»

```ts
// T è un segnaposto per il tipo passato o inferito.
function identity<T>(value: T): T {
  return value;
}

const name = identity('Ada'); // T diventa string.
const quantity = identity(3); // T diventa number.
```

Queste parentesi angolari non sono tag HTML e non confrontano numeri. Altri esempi: `Promise<string>`, `Array<number>`, `useState<Task[]>([])`.

## 5. Come leggere una firma «mostruosa»

```ts
// Qui T è il tipo dell'oggetto e K è una chiave valida di T.
function readField<T, K extends keyof T>(
  object: T,
  key: K,
): T[K] {
  return object[key];
}
```

Leggila pezzo per pezzo:

1. `T`: tipo dell'oggetto.
2. `keyof T`: insieme delle sue chiavi.
3. `K extends keyof T`: K può essere una di quelle chiavi.
4. `key: K`: il secondo argomento è una chiave consentita.
5. `T[K]`: il risultato ha il tipo del campo selezionato.

## 6. La tua convenzione didattica

Finché un concetto è nuovo: **tipo separato → firma semplice → funzione su più righe → versione compatta solo come confronto**.

Vale anche nei componenti React e negli esempi di callback, `map`, `filter` e generics.
