<!-- level: Reference -->
<!-- summary: Sintassi essenziale pronta da copiare: tipi, generics, oggetti, utility types, API, moduli e React -->
# TypeScript — Cheatsheet di sintassi

**Come usarla:** cerca il simbolo, copia il pattern e torna al capitolo collegato quando vuoi capire il *perché*.

## 1. Tipi e variabili

| Ti serve | Sintassi / significato |
|---|---|
| Inferenza | `const age = 28` → `number` inferito |
| Annotazione | `let age: number = 28` |
| Primitivi | `string`, `number`, `boolean`, `bigint`, `symbol` |
| Array | `string[]` oppure `Array<string>` |
| Oggetto | `{ id: string; price: number }` |
| Literal | `type Status = 'draft' \| 'paid'` |
| Union | `string \| null` → uno **o** l'altro |
| Intersection | `A & B` → caratteristiche **di entrambi** |
| Optional | `email?: string` → la proprietà può mancare |
| Readonly | `readonly id: string` → non riassegnare tramite TS |
| Tuple | `[number, string]` → ordine e posizioni note |
| Nessun valore | `void` (tipicamente funzioni senza risultato) |
| Valore assente | `undefined`, `null` (distinti con strict) |
| Sconosciuto | `unknown` → verifica prima dell'uso |
| Qualsiasi | `any` → perdi gran parte dei controlli |
| Impossibile | `never` (per es. funzione che lancia sempre) |

```ts
// Pattern: un ordine può trovarsi in uno dei tre stati.
type OrderStatus = 'draft' | 'paid' | 'shipped';

// Le parentesi quadre indicano un array di numeri.
const prices: number[] = [12, 8];

// ? sulla proprietà significa che può essere assente.
type Customer = { id: string; email?: string };
```

## 2. Simboli da riconoscere al volo

| Simbolo | Significato | Esempio |
|---|---|---|
| `: T` | Annotazione di tipo | `id: string` |
| `<T>` | Parametro generico di tipo | `function first<T>(xs: T[]): T` |
| `<string>` | Argomento di tipo concreto | `Promise<string>` |
| `T[]` | Array di `T` | `Product[]` |
| `\|` | Alternativa di tipo | `number \| null` |
| `&` | Intersezione fra tipi | `User & AdminFlags` |
| `?` | Proprietà o parametro opzionale | `email?: string` |
| `?.` | Optional chaining | `user?.name` |
| `??` | Valore sostitutivo solo per `null`/`undefined` | `name ?? 'ospite'` |
| `!` | Asserzione non-null (rischiosa) | `node!.focus()` |
| `as T` | Type assertion; **non** valida dati | `raw as User` |
| `as const` | Restringe literal e readonly a livello tipi | `['a', 'b'] as const` |
| `satisfies` | Verifica forma preservando inferenza | `obj satisfies Config` |
| `keyof T` | Unione dei nomi delle proprietà | `keyof User` |
| `T[K]` | Tipo della proprietà K in T | `User['id']` |
| `K extends keyof T` | K deve essere una chiave valida di T | `get<T, K extends keyof T>` |
| `import type` | Importa solo tipi | `import type { User } from './types'` |

**Attenzione:** `<T>` non è un valore passato alla funzione.

`T` è un segnaposto per un tipo, e puoi chiamarlo anche `Item` o `Result`.

## 3. Funzioni, callback, generics

```ts
// Parametri e valore restituito con tipo esplicito.
function total(price: number, qty = 1): number {
  return price * qty;
}

// Callback: una funzione ricevuta come parametro.
type Predicate<T> = (item: T) => boolean;

// Il tipo T si deduce dai valori passati.
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(['Ada', 'Lin']); // string | undefined
```

```ts
// Vincolo: T deve avere almeno la proprietà id.
function byId<T extends { id: string }>(row: T): string {
  return row.id;
}

// Il parametro K è limitato alle chiavi di T.
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## 4. `interface`, `type`, utility types

| Pattern | Per cosa serve |
|---|---|
| `interface User { id: string }` | Modello di oggetto estendibile |
| `type User = { id: string }` | Alias di tipo / unioni / tuple |
| `type Admin = User & { role: string }` | Aggiunge proprietà |
| `Partial<User>` | Tutte le proprietà di **primo livello** opzionali |
| `Required<User>` | Tutte le proprietà richieste |
| `Readonly<User>` | Proprietà in sola lettura **statica** |
| `Pick<User, 'id' \| 'name'>` | Solo campi scelti |
| `Omit<User, 'password'>` | Tutti i campi tranne quelli esclusi |
| `Record<string, number>` | Dizionario: chiavi stringa, valori numeri |
| `Exclude<A, B>` | Rimuove da union A i tipi B |
| `Extract<A, B>` | Seleziona da union A i tipi compatibili B |
| `NonNullable<T>` | Elimina `null` e `undefined` dal tipo |
| `ReturnType<typeof fn>` | Tipo restituito da una funzione |
| `Parameters<typeof fn>` | Tuple dei suoi parametri |
| `Awaited<Promise<T>>` | Tipo del risultato di una Promise |

```ts
// Definizione del modello.
type Product = { id: string; name: string; price: number };

// Creazione: id generato dal server.
type ProductCreate = Omit<Product, 'id'>;

// PATCH: solo alcuni campi modificabili.
type ProductPatch = Partial<Pick<Product, 'name' | 'price'>>;

// Mappa per codice prodotto.
const prices: Record<string, number> = { p1: 22 };
```

**Attenzione:** `Partial` non opera in profondità sugli oggetti annidati.

**Attenzione:** con `Record<string, T>` una chiave inesistente può restituire `undefined` a runtime; usa `noUncheckedIndexedAccess` o controlli espliciti.

## 5. Restringere i tipi (narrowing)

```ts
// unknown impone una verifica prima di usare metodi di string.
function normalize(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return 'n/d';
}

// Una proprietà discriminante distingue le varianti.
type Result =
  | { ok: true; data: string }
  | { ok: false; error: string };

function describe(result: Result): string {
  return result.ok ? result.data : result.error;
}
```

| Controllo | Uso |
|---|---|
| `typeof x === 'string'` | Tipi primitivi |
| `x instanceof Error` | Istanze di classi (nel runtime corrente) |
| `'id' in obj` | Presenza proprietà (verifica poi il valore) |
| `Array.isArray(x)` | Array |
| `function isUser(x: unknown): x is User` | Guard custom, da implementare davvero |
| `switch (x.kind)` | Union discriminata |

## 6. Promise, Fetch e JSON esterno

```ts
// Promise<T>: la funzione async produrrà T dopo l'attesa.
async function loadTitle(id: number): Promise<string> {
  const response = await fetch(`/api/items/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // Dati di rete: considera il contenuto non verificato.
  const raw: unknown = await response.json();
  if (typeof raw !== 'object' || raw === null || !('title' in raw)) {
    throw new Error('Risposta senza title');
  }
  if (typeof raw.title !== 'string') throw new Error('Title non valida');
  return raw.title;
}
```

`as User` **non valida** una risposta JSON. `fetch` **non** lancia un errore per ogni HTTP 404/500: controlla `response.ok`.

## 7. React + TypeScript

```tsx
import { useState, type ChangeEvent } from 'react';

type Props = { label: string; disabled?: boolean; onClick: () => void };

// Componente: le props seguono il contratto Props.
export function Action({ label, disabled = false, onClick }: Props) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}

export function SearchField() {
  const [query, setQuery] = useState(''); // TS inferisce string
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  };
  return <input value={query} onChange={onChange} />;
}
```

## 8. Moduli, configurazione e comandi

```ts
// types.ts
export type UserId = string;

// main.ts (altro file)
// import type { UserId } from './types.js';
```

| Operazione | Comando / impostazione |
|---|---|
| Installa | `npm install -D typescript` |
| Genera `tsconfig` | `npx tsc --init` |
| Controlla senza output | `npx tsc --noEmit` |
| Debug tipizzazione | passa il mouse in VS Code per il tipo inferito |
| Controlli rigorosi | `"strict": true` |
| Accessi dinamici più sicuri | `"noUncheckedIndexedAccess": true` |
| App browser con bundler | spesso `"moduleResolution": "Bundler"` |
| Node.js ESM | spesso `"module": "NodeNext"` (setup coerente) |
| File con JSX | `.tsx` |

## 9. Errori ricorrenti

- `number` non equivale a stringa numerica: usa `Number(text)` e valida il risultato.
- `readonly` e `as const` non rendono profondamente immutabili i dati a runtime.
- Il `?` su `email?: string` è diverso da `email: string | undefined`: il primo consente l'assenza della proprietà.
- `x!` silenzia il compilatore, ma può fallire a runtime.
- `as` asserisce un tipo: non converte né valida.
- Nel dubbio con dati esterni: `unknown` → controllo runtime → modello tipizzato.

**Approfondimenti:** [Handbook ufficiale TypeScript](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) e capitoli `02`–`08` di questo handbook.
