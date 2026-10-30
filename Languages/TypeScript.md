# TypeScript

> JavaScript con un sistema di tipi statico. Trova errori prima dell'esecuzione e rende espliciti i contratti tra moduli, API e componenti.
> Prerequisito: [JavaScript](JavaScript.md) · Collegate: [React](../Web%20%26%20Backend/React.md) · [Vue](../Web%20%26%20Backend/Vue.md)

## Modello mentale

- **I tipi spariscono a runtime** (*type erasure*): `tsc` controlla e poi emette JavaScript puro. Nessun tipo protegge da dati esterni non validati.
- **Tipizzazione strutturale:** due tipi sono compatibili se hanno la stessa *forma*, indipendentemente dal nome (diverso da Java/C#).
- **Inferenza:** scrivi i tipi ai confini (parametri, valori di ritorno pubblici, dati esterni), lascia inferire il resto.
- Un tipo è un **insieme di valori**: `|` è l'unione, `&` l'intersezione, `never` è l'insieme vuoto, `unknown` contiene tutto.
- Il **narrowing** restringe un tipo largo dentro un ramo di codice, in base ai controlli che fai (`typeof`, `in`, discriminanti).
- `strict: true` è l'unica configurazione sensata per un progetto nuovo.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Oggetto | `type Product = { sku: string; priceCents: number; tags?: string[] }` |
| Unione di letterali | `type Status = "pending" \| "paid" \| "shipped" \| "cancelled"` |
| Array / tupla | `Product[]` · `readonly Product[]` · `[sku: string, qty: number]` |
| Funzione | `type Fetcher = (id: number) => Promise<Order>` |
| Generico | `function first<T>(xs: T[]): T \| undefined` |
| Dizionario | `Record<string, number>` |
| Tipo da un valore | `typeof config` · `keyof Product` · `Product["sku"]` |
| Costante letterale | `const STATUSES = ["pending", "paid"] as const` |
| Controllo senza allargare | `const routes = {...} satisfies Record<string, string>` |
| Asserzione (evitala) | `value as Order` · `el!` (non-null) |

## `type` vs `interface`

Quasi intercambiabili per gli oggetti. `interface` supporta la *declaration merging* e `extends`; `type` supporta unioni, tuple, tipi mappati e condizionali. Regola pratica: `type` ovunque, `interface` per oggetti estendibili o API pubbliche di librerie.

```ts
interface Entity { id: number; createdAt: string }
interface Customer extends Entity { email: string }

type Money = { cents: number; currency: "EUR" | "USD" };
type PaidOrder = Entity & { status: "paid"; total: Money }; // intersezione
```

## `any`, `unknown`, `never`

| Tipo | Significato | Uso |
|---|---|---|
| `any` | disattiva il type checker | mai, salvo migrazioni |
| `unknown` | "qualsiasi cosa, ma devi controllarla prima di usarla" | dati esterni, `catch (e)` |
| `never` | nessun valore possibile | rami impossibili, controlli di esaustività |

## Narrowing e union discriminate

Una **union discriminata** ha un campo letterale comune (il *discriminante*) che permette a TS di capire quale variante hai in mano. È il modo idiomatico di modellare stati.

```ts
type PaymentResult =
  | { kind: "success"; transactionId: string }
  | { kind: "declined"; reason: string }
  | { kind: "error"; retryable: boolean };

function describe(result: PaymentResult): string {
  switch (result.kind) {
    case "success":  return `Pagato (${result.transactionId})`; // qui TS sa che c'è transactionId
    case "declined": return `Rifiutato: ${result.reason}`;
    case "error":    return result.retryable ? "Riprova" : "Contatta il supporto";
    default: {
      const unreachable: never = result; // errore di compilazione se aggiungi una variante e non la gestisci
      return unreachable;
    }
  }
}
```

Altri strumenti di narrowing: `typeof x === "string"`, `"email" in x`, `x instanceof Date`, `Array.isArray(x)`, `x != null`.

## Validare dati esterni

`response.json()` restituisce `any`: tipizzarlo con `as Order` è una **promessa non verificata**. Al confine si valida a runtime, con un *type guard* scritto a mano o con una libreria come **zod** (che deriva il tipo dallo schema).

```ts
type Order = { id: number; status: Status; totalCents: number };
type Status = "pending" | "paid" | "shipped" | "cancelled";

function isOrder(value: unknown): value is Order { // type guard: se true, value è Order
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "number"
    && typeof v.totalCents === "number"
    && ["pending", "paid", "shipped", "cancelled"].includes(v.status as string);
}

async function fetchOrder(id: number): Promise<Order> {
  const data: unknown = await (await fetch(`/api/orders/${id}`)).json();
  if (!isOrder(data)) throw new Error(`Risposta non valida per l'ordine ${id}`);
  return data; // Order, verificato
}
```

## Generics

Un generico è un **parametro di tipo**: la funzione funziona con molti tipi e conserva la relazione tra input e output. `extends` vincola cosa può essere `T`.

```ts
// continua dall'esempio precedente (tipi Order e Status)
// Raggruppa qualsiasi lista in base a una chiave che sia stringa.
function groupBy<T, K extends string>(items: T[], keyOf: (item: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    (groups[keyOf(item)] ??= []).push(item);
  }
  return groups;
}

const orders: Order[] = [{ id: 1, status: "paid", totalCents: 2599 }];
const byStatus = groupBy(orders, (o) => o.status); // Record<Status, Order[]>

// keyof + indexed access: la proprietà letta e il suo tipo restano collegati.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
const totals = pluck(orders, "totalCents"); // number[]
```

## Utility types

| Tipo | Risultato | Esempio d'uso |
|---|---|---|
| `Partial<T>` | tutti i campi opzionali | body di un `PATCH` |
| `Required<T>` | tutti obbligatori | config con default applicati |
| `Readonly<T>` | campi non riassegnabili | stato immutabile |
| `Pick<T, K>` / `Omit<T, K>` | sottoinsieme di campi | `Omit<Order, "id">` per la creazione |
| `Record<K, V>` | dizionario | `Record<Status, number>` |
| `ReturnType<F>` / `Parameters<F>` | tipi di una funzione | riusare tipi di librerie |
| `Awaited<T>` | valore di una Promise | `Awaited<ReturnType<typeof fetchOrder>>` |
| `NonNullable<T>` | toglie `null` e `undefined` | dopo un controllo |

## Tipi mappati e condizionali

```ts
// Mappato: trasforma ogni chiave di T.
type Validators<T> = { [K in keyof T]: (value: T[K]) => boolean };

// Condizionale con `infer`: estrae il tipo degli elementi di un array.
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;

const STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;
type StatusFromArray = ElementOf<typeof STATUSES>; // "pending" | "paid" | "shipped" | "cancelled"

// Template literal type.
type OrderEvent = `order.${StatusFromArray}`; // "order.pending" | "order.paid" | ...
```

`as const` rende un valore `readonly` e i suoi letterali esatti: è il modo di avere un'unica fonte di verità, sia come valore a runtime sia come tipo.

## Enum vs unione di letterali

Gli `enum` generano codice JavaScript a runtime e hanno qualche stranezza (gli enum numerici accettano qualsiasi numero). Un'**unione di letterali** con un array `as const` copre gli stessi casi senza costi a runtime: è la scelta più comune oggi.

## tsconfig: flag che contano

| Flag | Effetto |
|---|---|
| `strict` | attiva `strictNullChecks`, `noImplicitAny` e gli altri controlli severi |
| `noUncheckedIndexedAccess` | `arr[i]` e `record[key]` diventano `T \| undefined` |
| `exactOptionalPropertyTypes` | `x?: string` non accetta un `undefined` esplicito |
| `noImplicitOverride` | richiede `override` sui metodi ridefiniti |
| `verbatimModuleSyntax` | impone `import type` per gli import usati solo come tipi |

## Per gli esercizi di coding

```ts
// Firme chiare: input e output tipizzati, il resto è inferito.
function topKFrequent(skus: string[], k: number): string[] {
  const counts = new Map<string, number>();
  for (const sku of skus) counts.set(sku, (counts.get(sku) ?? 0) + 1);
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, k)
    .map(([sku]) => sku);
}

const grid: number[][] = Array.from({ length: 3 }, () => Array<number>(4).fill(0));
const pair: [number, number] = [0, 1]; // tupla: lunghezza e tipi fissi
const seen: Record<string, boolean> = {};
```

- Con `noUncheckedIndexedAccess`, `nums[i]` è `number | undefined`: controllalo o usa `!` solo se sei certo dell'indice.
- `!` (non-null assertion) e `as` spengono il controllo: un errore lì diventa un crash a runtime.
- `Map<K, V>` si tipizza meglio di un oggetto con chiavi dinamiche.

## Domande da colloquio

**Base**
- **Cosa fa TypeScript a runtime?** Niente: i tipi vengono rimossi in compilazione. Per i dati esterni serve una validazione a runtime.
- **`type` vs `interface`?** Per gli oggetti sono quasi equivalenti. `interface` si estende e si unisce (declaration merging); `type` esprime unioni, tuple, tipi mappati e condizionali.
- **`any` vs `unknown`?** `any` disattiva i controlli; `unknown` accetta qualsiasi valore ma obbliga a restringerlo prima dell'uso. Per i dati esterni si usa `unknown`.

**Intermedio**
- **Cos'è la tipizzazione strutturale?** La compatibilità dipende dalla forma: un oggetto con i campi richiesti è assegnabile anche se dichiarato con un altro tipo. Conseguenza: due tipi con nomi diversi ma stessa forma sono intercambiabili.
- **Cos'è una union discriminata?** Un'unione di oggetti con un campo letterale comune; controllandolo, TS restringe il tipo. Con `never` nel `default` hai un controllo di esaustività a compile time.
- **A cosa servono i generics?** A scrivere codice riutilizzabile conservando le relazioni tra tipi (input `T` → output `T`). I vincoli `extends` limitano i tipi ammessi.
- **Type guard vs `as`?** Un type guard verifica a runtime e restringe il tipo; `as` afferma il tipo senza controllo: se l'affermazione è falsa, l'errore emerge più avanti.
- **Perché `satisfies`?** Verifica che un valore rispetti un tipo senza allargarlo, conservando i letterali specifici per l'inferenza.
- **Cosa sono gli overload di funzione?** Più firme dichiarate per la stessa implementazione, per esprimere che il tipo di ritorno dipende dagli argomenti. Spesso un'unione o un generico sono più semplici.

**Avanzato**
- **Cosa sono i tipi condizionali e `infer`?** Tipi del tipo `T extends U ? X : Y`; `infer` cattura una parte del tipo (l'elemento di un array, il ritorno di una funzione). Se `T` è un parametro "nudo", su un'unione si distribuiscono variante per variante.
- **Perché si preferiscono le unioni di letterali agli enum?** Non generano codice a runtime, si combinano con `as const` e i tipi mappati, ed evitano le stranezze degli enum numerici.
- **Varianza dei parametri di funzione?** Con `strictFunctionTypes` i parametri delle funzioni sono controllati in modo controvariante; i metodi restano bivarianti per compatibilità, ed è una delle poche falle note del sistema di tipi.
- **Come migri un progetto JavaScript a TypeScript?** Gradualmente: `allowJs` e `checkJs`, rinomina i file un modulo alla volta partendo dalle foglie, tipizza i confini (API, dati esterni), poi attiva `strict` per gradi riducendo gli `any`.

## Approfondisci

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) · [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) · [TSConfig reference](https://www.typescriptlang.org/tsconfig)
- [zod](https://zod.dev/) — validazione a runtime con tipi inferiti
