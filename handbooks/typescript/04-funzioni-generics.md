<!-- level: Fondamenti -->
<!-- summary: Funzioni tipizzate, callback, generics T, vincoli extends e risultati -->
# Funzioni, callback e generics (`<T>`)

Un **generic** permette di descrivere una relazione fra tipi senza fissarli in anticipo.  
Ti serve quando la stessa funzione deve lavorare con prodotti, utenti, numeri o stringhe **conservando il tipo corretto**.

## 1. Prima: parametri e valore restituito

**Prima di leggere il codice — simboli e termini:**

- **`<T>` / `<K>`**: parametri **di tipo**: segnaposto per tipi, non valori JavaScript.
- **`keyof T`**: insieme dei nomi delle proprietà di `T`.

```ts
// Il parametro price è un numero; la funzione restituisce un numero.
function withTax(
  price: number,
  rate: number = 0.22,
): number {
  return price * (1 + rate);
}

const total = withTax(100); // 122
```

`price: number` descrive un parametro, `): number` descrive il risultato e `rate = 0.22` assegna un valore predefinito.

## 2. Che cosa significa `<T>`?

`T` significa per convenzione **Type**.  
È un nome scelto dal programmatore, non una parola riservata.  
Le parentesi angolari `<...>` indicano uno o più **parametri di tipo**; non sono confronti matematici.

```ts
// T assume il tipo degli elementi che passi alla chiamata.
function first<T>(items: T[]): T | undefined {
  return items[0]; // undefined se l'array è vuoto
}

const firstPrice = first([9.9, 4.5]);  // T = number
const firstName = first(['Ada', 'Lin']); // T = string
const nothing = first<number>([]);      // specifica T esplicitamente
```

Leggi la firma così: «data una lista di elementi di tipo `T`, restituisci un `T` oppure `undefined`».

**Attenzione subito dopo l'esempio:** `<T>` non crea un tipo nuovo a runtime.
TypeScript controlla i tipi mentre sviluppi, poi li rimuove quando genera JavaScript.
Il controllo `undefined` serve davvero anche nel programma eseguito.

## 3. `T extends ...`: imporre un requisito

Se vuoi accedere a `.id`, devi garantire che ogni elemento lo possieda.

```ts
// T può avere altri campi, ma deve almeno avere id: string.
function indexById<T extends { id: string }>(
  rows: T[],
): Map<string, T> {
  // Crea coppie [ID, oggetto] per costruire la Map.
  const entries = rows.map((row) => {
    // "as const" mantiene questa coppia una tupla readonly.
    return [row.id, row] as const;
  });

  // Le chiavi sono stringhe; i valori conservano il tipo T.
  return new Map(entries);
}

const byId = indexById([
  { id: 'p1', name: 'Tastiera', price: 49 },
  { id: 'p2', name: 'Mouse', price: 25 },
]);

// Map.get restituisce il valore associato alla chiave oppure undefined.
const product = byId.get('p1'); // prodotto oppure undefined
console.log(product?.price); // l'accesso ?. è sicuro se manca la chiave
```

`extends` qui significa **deve essere compatibile con la struttura richiesta**.  
Non ti obbliga a creare una classe derivata.

## 4. Funzioni come valori: callback

Una *callback* è una funzione passata a un'altra funzione. `(value: T) => boolean` descrive **il tipo della callback**, non la sua implementazione.

```ts
// Validator<T> è un tipo di funzione: riceve T, restituisce boolean.
type Validator<T> = (value: T) => boolean;

function filterValid<T>(
  items: T[],
  isValid: Validator<T>,
): T[] {
  // filter chiama isValid per ciascun elemento e crea un array nuovo.
  return items.filter(isValid);
}

// L'implementazione della callback è separata dalla firma del suo tipo.
function isPositive(value: number): boolean {
  return value > 0;
}

const positive = filterValid([10, -1, 4], isPositive);
console.log(positive); // [10, 4]
```

## 5. `K extends keyof T`: chiavi valide

```ts
// K può essere solo una chiave presente nel tipo T.
function readField<T, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  // Il tipo del risultato dipende da K: la chiave scelta.
  return obj[key];
}

const user = { id: 'u1', name: 'Ada' };
const userName = readField(user, 'name'); // string
// readField(user, 'email'); // errore: email non è una chiave di user
```

`keyof T` è l'insieme delle chiavi; `T[K]` è il tipo del valore associato alla chiave.

## Quando evitare i generics

Se la funzione gestisce **solo numeri**, la firma `function double(n: number): number` è più chiara di `function double<T extends number>(n: T)`.

**Regola pratica:** usa un generic quando lo stesso parametro di tipo compare in più punti della firma e collega input e output.
