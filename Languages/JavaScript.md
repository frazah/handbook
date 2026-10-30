# JavaScript

> Il linguaggio del browser e di Node.js: dinamico, single-thread con event loop, funzioni come valori. Base di [TypeScript](TypeScript.md), [React](../Web%20%26%20Backend/React.md) e [Vue](../Web%20%26%20Backend/Vue.md).
> Collegate: [Pattern algoritmici](../Fundamentals/Pattern%20algoritmici.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md)

## Modello mentale

- **Single-thread + event loop:** un solo call stack esegue il codice; le operazioni lente (rete, timer) sono delegate all'ambiente e le loro callback rientrano in coda quando lo stack è vuoto.
- **Primitivi** (`string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`) sono immutabili e copiati per valore; **oggetti** (inclusi array e funzioni) sono passati per riferimento.
- Le funzioni sono valori e **ricordano lo scope in cui sono nate** (closure).
- `this` dipende da **come** una funzione viene chiamata, non da dove è definita (le arrow function fanno eccezione: lo ereditano).
- L'ereditarietà è **prototipale**: ogni oggetto ha un prototipo a cui delega le proprietà mancanti. `class` è sintassi sopra questo meccanismo.
- La **coercizione** implicita (`"5" * 2 === 10`) è fonte di bug: usa `===` e conversioni esplicite.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Variabili | `const` di default, `let` se riassegni, mai `var` |
| Destructuring | `const { id, status = "pending" } = order` · `const [first, ...rest] = items` |
| Spread | `{ ...order, status: "paid" }` · `[...items, newItem]` |
| Optional chaining / nullish | `order.customer?.email ?? "n/d"` |
| Template string | `` `Totale: ${(cents / 100).toFixed(2)} €` `` |
| Arrow function | `const total = (items) => items.reduce((s, i) => s + i.price, 0)` |
| Parametri default/rest | `function f(limit = 20, ...ids) {}` |
| Moduli ESM | `import { api } from "./api.js"` · `export default App` |
| Iterare | `for (const item of items)` (valori) · `for (const key in obj)` (chiavi, evitalo sugli array) |
| Classi | `class Cart { #items = []; add(i) { this.#items.push(i) } }` (`#` = privato) |

### Metodi degli array

| Metodo | Restituisce | Muta? |
|---|---|---|
| `map`, `filter`, `flatMap` | nuovo array | no |
| `reduce` | valore accumulato | no |
| `find` / `findIndex` / `some` / `every` | elemento / indice / boolean | no |
| `includes`, `at(-1)` | boolean / ultimo elemento | no |
| `sort`, `reverse`, `splice`, `push`, `pop` | l'array stesso | **sì** |
| `toSorted`, `toReversed`, `with` (ES2023) | nuovo array | no |

## Tipi, uguaglianza e coercizione

```js
0 == "";            // true  — coercizione: evita ==
0 === "";           // false
null == undefined;  // true (l'unico caso in cui `== null` è utile)
typeof null;        // "object" — bug storico
Number.isNaN(NaN);  // true; NaN !== NaN
0.1 + 0.2 === 0.3;  // false — floating point: per il denaro usa interi in centesimi
```

Valori **falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Per questo `qty || 1` trasforma `0` in `1`, mentre `qty ?? 1` lo lascia `0`.

## Scope, hoisting e closure

- `var` ha scope di funzione ed è "hoisted" con valore `undefined`; `let`/`const` hanno scope di blocco e, prima della dichiarazione, stanno nella **TDZ** (temporal dead zone): accedervi lancia `ReferenceError`.
- Una **closure** è una funzione che conserva l'accesso alle variabili dello scope esterno anche dopo che questo è terminato.

```js
function createIdGenerator(prefix) {
  let next = 1; // privata: accessibile solo tramite la closure
  return () => `${prefix}-${next++}`;
}
const nextOrderId = createIdGenerator("ORD");
nextOrderId(); // -> "ORD-1"
nextOrderId(); // -> "ORD-2"

// Trappola classica: con `var` c'è UNA sola variabile i, condivisa dalle callback.
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2 (una j per iterazione)
```

## `this`

| Chiamata | `this` vale |
|---|---|
| `obj.method()` | `obj` |
| `fn()` (strict mode / moduli) | `undefined` |
| `new Fn()` | il nuovo oggetto |
| `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)` | `x` |
| arrow function | il `this` dello scope in cui è definita |

```js
const cart = {
  items: ["MUG-2"],
  logLater() {
    setTimeout(() => console.log(this.items), 0); // arrow: `this` resta `cart`
  },
};
const { logLater } = cart;
// logLater(); -> TypeError nel callback: chiamata senza oggetto, `this` è undefined
```

## Oggetti, copie e immutabilità

```js
const order = { id: 101, items: [{ sku: "MUG-2", qty: 1 }] };

const shallow = { ...order, status: "paid" };
shallow.items.push({ sku: "PEN-3", qty: 2 }); // modifica ANCHE order.items: copia superficiale

const deep = structuredClone(order); // copia profonda (no funzioni, no classi custom)
deep.items[0].qty = 5;               // order non cambia
```

- `const` impedisce la riassegnazione, non la mutazione dell'oggetto. Per congelarlo (solo al primo livello): `Object.freeze`.
- `Map` invece di un oggetto per dizionari con chiavi dinamiche: chiavi di qualsiasi tipo, `size`, ordine di inserimento garantito, nessuna collisione con il prototipo. `WeakMap` tiene chiavi oggetto senza impedirne la garbage collection.

## Prototipi e classi

```js
class Product {
  #priceCents; // campo privato: non accessibile fuori dalla classe

  constructor(sku, priceCents) {
    this.sku = sku;
    this.#priceCents = priceCents;
  }
  get price() { return this.#priceCents / 100; }
  static fromJSON(json) { return new Product(json.sku, json.price_cents); }
}

class DigitalProduct extends Product {
  constructor(sku, priceCents, url) {
    super(sku, priceCents); // obbligatorio prima di usare `this`
    this.url = url;
  }
}
// I metodi vivono su Product.prototype, condivisi da tutte le istanze.
Object.getPrototypeOf(new DigitalProduct("EB-1", 999, "/dl")) === DigitalProduct.prototype; // true
```

## Event loop, Promise e async/await

L'ordine di esecuzione: tutto il codice sincrono → **tutte le microtask** (callback di Promise, `queueMicrotask`) → **una macrotask** (timer, I/O, eventi) → di nuovo le microtask…

```js
console.log("1 sync");
setTimeout(() => console.log("4 macrotask"), 0);
Promise.resolve().then(() => console.log("3 microtask"));
console.log("2 sync");
// Output: 1 sync, 2 sync, 3 microtask, 4 macrotask
```

Una **Promise** rappresenta un valore futuro: *pending* → *fulfilled* o *rejected*. `async/await` è sintassi sopra le Promise: `await` sospende la funzione (non il thread) fino a quando la Promise si risolve.

```js
// illustrativo: richiede un'API /api/*; l'`await` top-level funziona solo nei moduli ESM
async function loadOrder(id, { signal } = {}) {
  const res = await fetch(`/api/orders/${id}`, { signal });
  // fetch rifiuta solo per errori di rete: i 4xx/5xx vanno controllati a mano
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // timeout: annulla la richiesta dopo 5s

// In parallelo, non in sequenza: il tempo totale è quello della richiesta più lenta.
const [order, customer] = await Promise.all([
  loadOrder(101, { signal: controller.signal }),
  fetch("/api/customers/7").then((r) => r.json()),
]);
```

| Combinatore | Si risolve quando | Rifiuta quando |
|---|---|---|
| `Promise.all` | tutte sono fulfilled | **la prima** rifiuta |
| `Promise.allSettled` | tutte sono concluse (mai rifiuta) | — |
| `Promise.race` | la prima si conclude, in qualunque modo | idem |
| `Promise.any` | la prima è fulfilled | tutte rifiutano |

Errori comuni: `await` dentro un `for` serializza richieste indipendenti; una Promise senza `catch` causa un *unhandled rejection*; `forEach` ignora le funzioni `async` (usa `for...of` o `Promise.all(items.map(...))`).

## Moduli

| | ESM | CommonJS |
|---|---|---|
| Sintassi | `import` / `export` | `require` / `module.exports` |
| Caricamento | statico, analizzabile (tree shaking) | dinamico, sincrono |
| Dove | browser, Node moderno (`"type": "module"`) | codice Node legacy |

## Eventi nel DOM

Gli eventi fanno **capturing** (dalla radice al target) e poi **bubbling** (dal target alla radice). La **event delegation** sfrutta il bubbling: un solo listener sul contenitore invece di uno per elemento.

```js
// illustrativo: richiede un browser con una <ul id="cart"> di <li data-sku="...">
document.querySelector("#cart").addEventListener("click", (event) => {
  const row = event.target.closest("li[data-sku]");
  if (row) removeFromCart(row.dataset.sku); // funziona anche per <li> aggiunti dopo
});
```

## Per gli esercizi di coding

- `sort()` senza comparatore ordina **come stringhe**: `[10, 9, 1].sort()` → `[1, 10, 9]`. Usa `nums.sort((a, b) => a - b)`.
- `Map`/`Set` per conteggi e "già visto": `counts.set(x, (counts.get(x) ?? 0) + 1)`.
- Array 2D: `Array.from({ length: rows }, () => Array(cols).fill(0))`. Con `Array(rows).fill([])` tutte le righe sono **lo stesso array**.
- `Number.MAX_SAFE_INTEGER` è 2⁵³−1: oltre si perde precisione e serve `BigInt` (`10n ** 20n`).
- Divisione intera: `Math.trunc(a / b)` (verso zero) o `Math.floor` (verso −∞).
- Stringhe immutabili: accumula in un array e chiama `join("")`.
- Non esistono **heap** e **deque** nativi. Per una coda BFS usa un array con un indice di testa (`queue[head++]`) invece di `shift()`, che è `O(n)`. Heap minimo:

```js
class MinHeap {
  #a = [];
  get size() { return this.#a.length; }
  peek() { return this.#a[0]; }
  push(x) {
    const a = this.#a;
    a.push(x);
    for (let i = a.length - 1, p; i > 0 && a[(p = (i - 1) >> 1)] > a[i]; i = p) {
      [a[i], a[p]] = [a[p], a[i]]; // risale finché il padre è più grande
    }
  }
  pop() {
    const a = this.#a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) { // scende scambiando con il figlio minore
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
```

## Domande da colloquio

**Base**
- **`==` vs `===`?** `==` converte i tipi prima di confrontare (`0 == ""` è true); `===` no. Si usa sempre `===`, salvo `x == null` per controllare insieme `null` e `undefined`.
- **`let`, `const`, `var`?** `var` ha scope di funzione ed è hoisted come `undefined`; `let`/`const` hanno scope di blocco e la TDZ. `const` impedisce la riassegnazione, non la mutazione.
- **`null` vs `undefined`?** `undefined` = valore mai assegnato; `null` = assenza esplicita, decisa dal programmatore.
- **Cos'è una closure?** Una funzione che mantiene il riferimento alle variabili del suo scope di definizione. Serve per dati privati, factory e callback.

**Intermedio**
- **Come funziona l'event loop?** Esegue il codice sincrono, poi svuota tutte le microtask (Promise), poi esegue una macrotask (timer, I/O) e ricomincia. Per questo una `then` viene eseguita prima di un `setTimeout(…, 0)`.
- **Come si determina `this`?** Dal modo in cui la funzione è chiamata: metodo, chiamata semplice, `new`, `call`/`bind`. Le arrow function non hanno un `this` proprio.
- **`Promise.all` vs `allSettled`?** `all` fallisce alla prima rejection (utile se servono tutti i risultati); `allSettled` aspetta tutti e riporta l'esito di ciascuno.
- **Event delegation?** Un listener su un antenato comune che, grazie al bubbling, gestisce gli eventi dei figli, anche quelli aggiunti dinamicamente.
- **Shallow vs deep copy?** Lo spread copia solo il primo livello; `structuredClone` copia ricorsivamente (ma non funzioni né prototipi custom).
- **`call`, `apply` e `bind`?** Tutti fissano `this`: `call(thisArg, a, b)` e `apply(thisArg, [a, b])` invocano subito la funzione, `bind` restituisce una nuova funzione con `this` (ed eventuali argomenti) fissati.
- **Debounce vs throttle?** Il debounce esegue la funzione solo dopo una pausa di N ms dall'ultimo evento (ricerca mentre digiti); il throttle la esegue al massimo una volta ogni N ms (scroll, resize). Entrambi si implementano con una closure e `setTimeout`.

**Avanzato**
- **Ereditarietà prototipale vs classi?** Gli oggetti delegano le proprietà mancanti al loro prototipo lungo una catena; `class` è zucchero sintattico che imposta `prototype` e `super`.
- **Microtask starvation?** Microtask che ne accodano continuamente altre impediscono l'esecuzione di macrotask e rendering, bloccando la pagina.
- **Come può esserci un memory leak con un garbage collector?** Riferimenti che restano raggiungibili: listener mai rimossi, timer attivi, cache globali, closure che trattengono oggetti grandi. `WeakMap` e `WeakRef` aiutano.
- **ESM vs CommonJS?** ESM è statico (import risolti prima dell'esecuzione, tree shaking, `await` top-level); CJS è dinamico e sincrono.

## Approfondisci

- [MDN — JavaScript Guide](https://developer.mozilla.org/docs/Web/JavaScript/Guide)
- [MDN — Event loop e microtask](https://developer.mozilla.org/docs/Web/JavaScript/Event_loop)
- [javascript.info](https://javascript.info/) — tutorial moderno e completo
