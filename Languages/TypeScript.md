# TypeScript — Cheatsheet

> **Quando serve:** dare contratti espliciti a dati, funzioni e componenti; intercettare errori prima dell'esecuzione. I tipi scompaiono dopo la compilazione: **non validano JSON a runtime**.

TypeScript aggiunge controllo statico a JavaScript. Parti da **inferenza + tipi chiari**; evita `any` dove possibile. `unknown` richiede un controllo prima dell'uso.

## Sintassi al volo

| Sintassi | Significato |
|---|---|
| `let count: number = 0` | annotazione |
| `type Status = 'draft' \| 'paid'` | union di valori letterali |
| `name?: string` | proprietà opzionale |
| `string[]` / `Array<string>` | array di stringhe |
| `readonly id: string` | non riassegnabile nel codice TS |
| `value: string \| null` | uno tra più tipi |
| `x is User` | type predicate in una guardia |
| `keyof User` | unione dei nomi delle proprietà |
| `typeof value` | tipo ricavato da un valore |
| `T[K]` | tipo della proprietà `K` di `T` |

```ts
type Product = {
  id: string;
  name: string;
  price: number;
  description?: string; // può non esserci
};

const product: Product = {
  id: 'p1',
  name: 'Libro',
  price: 20,
};

// Union: accettiamo solo stati validi.
type OrderStatus = 'pending' | 'paid' | 'cancelled';

function describeStatus(status: OrderStatus): string {
  if (status === 'paid') return 'Pagato';
  if (status === 'cancelled') return 'Annullato';
  return 'In attesa';
}
```

## Concetti applicati

### Callback e tipi di funzione (senza firme diaboliche)

```ts
// Questa riga descrive un TIPO di funzione, non la esegue:
// riceve un titolo stringa; il chiamante non usa un valore di ritorno.
type OnAddTask = (title: string) => void;

type AddTaskProps = {
  onAdd: OnAddTask;
};

function notifyNewTask(props: AddTaskProps): void {
  props.onAdd('Studiare TypeScript');
}
```

### Generics `<T>`

`T` è un **segnaposto per un tipo**, scelto quando usi la funzione. Può essere `string`, `Product` ecc. Evita di perdere la relazione tra input e output.

```ts
// T rappresenta un oggetto che ha almeno un campo id stringa.
// L'output conserva il tipo specifico di ogni record (es. Product).
function indexById<T extends { id: string }>(rows: T[]): Record<string, T> {
  return Object.fromEntries(rows.map((row) => [row.id, row]));
}

const productsById = indexById([product]);
// Con noUncheckedIndexedAccess, l'accesso può essere undefined:
const selected = productsById['p1'];

// `keyof T` limita K alle proprietà realmente presenti su T.
function getField<
  T,
  K extends keyof T
>(
  object: T,
  key: K
): T[K] {
  return object[key];
}

const productName = getField(product, 'name'); // string
```

**Leggi lentamente la seconda firma:** `T` = tipo oggetto; `K` = una chiave valida di `T`; `T[K]` = tipo del valore di quella chiave.

### Utility types principali

```ts
// Tutte le proprietà di primo livello diventano opzionali.
type ProductPatch = Partial<Product>;

// Mantiene soltanto alcune proprietà.
type ProductPreview = Pick<Product, 'id' | 'name'>;

// Esclude una proprietà.
type ProductWithoutPrice = Omit<Product, 'price'>;

// Dizionario con chiavi stringa e valori numerici.
type Inventory = Record<string, number>;
```

**Attenzione:** `Partial<T>` è **superficiale**: non modifica ricorsivamente proprietà annidate. `Record<string, number>` descrive un insieme indicizzato, ma non dimostra che una particolare chiave esista a runtime; verifica l'accesso (e considera `noUncheckedIndexedAccess`).

### Narrowing e dati esterni

```ts
function printValue(value: unknown): void {
  // Senza questo controllo, `unknown` non può essere trattato come string.
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  }
}

// Il `as Product` NON valida dati provenienti dalla rete.
// Per input non fidato serve validazione runtime (schema/guardia).
```

---

```ts
async function loadProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  // Qui va validato `data` a runtime prima di considerarlo Product.
  // Un'asserzione di tipo da sola NON è una validazione.
  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    typeof data.id !== 'string' ||
    !('name' in data) ||
    typeof data.name !== 'string' ||
    !('price' in data) ||
    typeof data.price !== 'number'
  ) {
    throw new Error('Dati prodotto non validi');
  }

  return { id: data.id, name: data.name, price: data.price };
}
```

**Config consigliata:** attiva `strict` in `tsconfig.json`; usa `noUncheckedIndexedAccess` per controllare accessi ad array/dizionari quando appropriato.

### Interface, union discriminate ed esaustività

```ts
interface Customer {
  id: string;
  email: string;
}

// Il campo `kind` distingue gli stati e i campi ammessi.
type PaymentResult =
  | { kind: 'ok'; transactionId: string }
  | { kind: 'declined'; reason: string }
  | { kind: 'retry'; retryAfterSeconds: number };

function paymentMessage(result: PaymentResult): string {
  switch (result.kind) {
    case 'ok':
      return `Payment ${result.transactionId} completed`;
    case 'declined':
      return result.reason;
    case 'retry':
      return `Try again in ${result.retryAfterSeconds}s`;
    default: {
      // Se aggiungi un nuovo stato alla union, il compilatore segnala questo ramo.
      const impossible: never = result;
      return impossible;
    }
  }
}
```

`interface` descrive oggetti ed è estendibile (`extends`) e riapribile (*declaration merging*); `type` esprime anche union, tuple e tipi derivati. `never` significa «nessun valore possibile» e serve per controllare gli `switch` esaustivi.

### Tipi derivati e controllo prima del runtime

```ts
interface UserRecord {
  id: string;
  email: string;
  isAdmin: boolean;
}

// La view pubblica NON deve contenere il flag amministratore.
type PublicUser = Pick<UserRecord, 'id' | 'email'>;

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// `satisfies` controlla la forma senza sostituire completamente
// l'inferenza del valore, a differenza di una grossolana assertion `as`.
const routePermissions = {
  '/admin': 'admin',
  '/catalog': 'visitor',
} satisfies Record<string, 'admin' | 'visitor'>;

function showResult(result: ApiResult<PublicUser>): string {
  if (!result.ok) return result.error;
  return result.data.email;
}
```

**Da ricordare:** `readonly` e `private` di TypeScript non sono protezioni di sicurezza del server; i tipi spariscono in JavaScript. `as const` conserva valori letterali e rende readonly a livello di tipo; `as Tipo` *non valida dati esterni*. Per librerie e API combina `strict`, `unknown` e validazione runtime. [TypeScript: discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions), [Utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html).

## Domande da colloquio

**`type` vs `interface`?** Entrambi modellano oggetti; `interface` supporta declaration merging, `type` descrive anche union e tuple.

**`any` vs `unknown`?** `any` disattiva molti controlli; `unknown` obbliga a verificare il valore prima di usarlo.

**Cos'è un generic?** Parametrizza un tipo mantenendo relazioni tra input e output senza perdere precisione.

**Type assertion vs validation?** `as` convince il compilatore; una validazione controlla il dato reale durante l'esecuzione.

**Union discriminata?** Un campo comune (`kind`, `status`) permette a TypeScript di restringere il tipo nei vari rami.

**Approfondisci quando serve:** [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) e [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html). `Record` e `Partial` non sostituiscono la validazione dei dati di rete.
