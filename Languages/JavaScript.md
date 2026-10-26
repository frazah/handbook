# JavaScript — Cheatsheet

> **Quando serve:** logica di applicazione, browser, Node.js, manipolazione dati, richieste API. Basata sui concetti principali dell'handbook JS precedente.

JavaScript è dinamico: il tipo è associato ai **valori**, non alle variabili. Oggetti/array sono passati come **riferimenti a oggetti** (il valore passato è il riferimento); le primitive sono valori immutabili. `const` impedisce di riassegnare la variabile, **non** di modificare un oggetto.

## Sintassi al volo

| Obiettivo | Sintassi | Da ricordare |
|---|---|---|
| Variabili | `const x = 1`, `let x = 2` | preferisci `const` |
| Confronti | `===`, `!==`, `>`, `<=` | evita coercizioni involontarie con `==` |
| Valore predefinito | `x ?? fallback` | solo per `null`/`undefined` |
| Fallback falsy | `x || fallback` | considera anche `0`, `false`, `''` |
| Accesso sicuro | `user?.address?.city` | può restituire `undefined` |
| Stringa interpolata | `` `Ciao ${name}` `` | usa backtick |
| Spread | `[...items]`, `{...obj}` | **copia superficiale** |
| Rest | `function f(...args) {}` | raccoglie argomenti |
| Destructuring | `const { id, name } = product` | estrae proprietà |
| Export/import | `export { fn }` / `import { fn } from './x.js'` | moduli ES |

```js
const product = { id: 1, name: 'Penna', price: 3 };

// Estraggo due proprietà dall'oggetto.
const { name, price } = product;

// `??` preserva 0, false e stringhe vuote.
const discount = product.discount ?? 0;
const finalPrice = price - discount;
```

### Array: comandi che usi ogni giorno

```js
const orders = [
  { id: 1, total: 30, paid: true },
  { id: 2, total: 10, paid: false },
  { id: 3, total: 50, paid: true },
];

// `filter` restituisce un array più piccolo (non modifica l'originale).
const paidOrders = orders.filter((order) => order.paid);

// `map` trasforma ogni elemento in un nuovo valore.
const totals = paidOrders.map((order) => order.total);

// `reduce` combina i valori in un unico risultato.
const revenue = totals.reduce((sum, total) => sum + total, 0);

const found = orders.find((order) => order.id === 2); // oggetto o undefined
const hasLargeOrder = orders.some((order) => order.total > 40);
```

**Attenzione:** `sort()` e `reverse()` modificano l'array originale. Per preservarlo usa ad esempio `[...orders].sort(...)` o i metodi immutabili moderni disponibili nell'ambiente.

## Concetti applicati

### Funzioni, callback, closure

```js
// Callback reale: filtrare gli ordini prima di preparare un report.
function isPaid(order) {
  return order.status === 'paid';
}

const orders = [
  { id: 101, status: 'paid', totalCents: 2599 },
  { id: 102, status: 'pending', totalCents: 990 },
];

const paidOrders = orders.filter(isPaid);

// Closure reale: un identificatore progressivo per richieste nella UI.
// La variabile `nextId` resta accessibile anche dopo createRequestId().
function createRequestId() {
  let nextId = 0;

  return function issueId() {
    nextId += 1;
    return `request-${nextId}`;
  };
}

const issueId = createRequestId();
console.log(issueId()); // request-1
```

- **Scope**: visibilità di variabili; `let` e `const` hanno scope di blocco.
- **`this`**: nelle funzioni normali dipende da come sono invocate; le arrow function catturano `this` dall'ambiente circostante.
- **Prototype**: meccanismo con cui gli oggetti possono ereditare proprietà/metodi; `class` offre sintassi più leggibile sopra tale modello.

### Async/await e Promise

```js
async function loadProducts() {
  // `await` aspetta il completamento della Promise, non blocca tutto JS.
  const response = await fetch('/api/products');

  // `fetch` non lancia automaticamente un errore per HTTP 404/500.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

try {
  const products = await loadProducts(); // top-level await: in modulo ES
  console.log(products);
} catch (error) {
  console.error('Caricamento fallito', error);
}
```

`Promise.all([a, b])` attende tutte le Promise e fallisce appena una viene rifiutata; `Promise.allSettled` raccoglie anche gli esiti falliti.

---

```js
// Aggiornamento immutabile: utile anche in React.
const cart = [{ id: 1, quantity: 1 }, { id: 2, quantity: 3 }];

const updatedCart = cart.map((item) => {
  if (item.id === 1) {
    return { ...item, quantity: item.quantity + 1 };
  }

  return item;
});

// Form reale: cattura una ricerca senza ricaricare la pagina.
// Presuppone <form id="search-form"><input name="q"></form> nell'HTML.
const form = document.querySelector('#search-form');

form?.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita il normale invio/refresh del form.

  const data = new FormData(form);
  const query = String(data.get('q') ?? '').trim();

  if (query) {
    console.log('Cerca nel catalogo:', query);
    // Qui l'app chiama il proprio servizio di ricerca o aggiorna la UI.
  }
});
```

**Errori frequenti:** confrontare oggetti con `===` verifica l'identità, non il contenuto; `forEach()` non produce un nuovo array; `await` fuori da `async` è consentito solo in contesti appropriati (per esempio il top-level di moduli ES).

### Controllo del flusso, strutture e classi

```js
// Una lista di ordini con importi in centesimi (evitiamo errori di float).
const ordersForExport = [
  { id: 101, status: 'paid', totalCents: 2599 },
  { id: 102, status: 'pending', totalCents: 990 },
];

for (const order of ordersForExport) {
  // `continue` salta gli ordini non ancora pagati.
  if (order.status !== 'paid') continue;
  console.log(order.id, order.totalCents);
}

// Map: lookup per chiave; Set: valori senza duplicati.
const byId = new Map(ordersForExport.map((order) => [order.id, order]));
const statuses = new Set(ordersForExport.map((order) => order.status));
console.log(byId.get(101), statuses.has('paid'));

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function requirePaid(order) {
  if (order.status !== 'paid') throw new ApiError(409, 'Not paid');
  return order;
}
```

`class` crea oggetti con metodi condivisi tramite il **prototype**: non copia ogni metodo in ciascuna istanza. `Map` accetta chiavi di ogni tipo; `Set` è utile per unicità. Per i casi comuni preferisci `if`, `for...of` e metodi array a strutture più complicate.

### Errori e modello asincrono

```js
async function loadOrder(id, { signal } = {}) {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Order request failed');
    }
    return await response.json();
  } catch (error) {
    // Un'interruzione volontaria NON è un errore da mostrare all'utente.
    if (error?.name === 'AbortError') throw error;
    console.error('Request failed', error);
    throw error; // Il chiamante decide se ritentare o mostrare un messaggio.
  }
}
```

**Event loop spiegato:** JS esegue prima il codice sul *call stack*; quando lo stack si libera, vengono eseguite le **microtask** pronte (es. callback di `Promise.then`) prima di passare alla prossima **task** (es. timer). Non significa che `fetch` blocchi il thread mentre aspetta la rete.

```js
console.log('A');
setTimeout(() => console.log('C: task'), 0);
Promise.resolve().then(() => console.log('B: microtask'));
// In un ambiente JS standard: A, B, C.
```

`AbortController` gestisce richieste obsolete; `Promise.all` conviene per I/O indipendenti. Per carichi CPU usa Worker/worker thread, non aspettarti che `async` renda paralleli i calcoli. **Approfondimento:** [MDN: event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop), [MDN: inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain).

## Domande da colloquio

**`let` vs `const` vs `var`?** Scope di blocco e riassegnazione per i primi due; `var` ha scope di funzione e hoisting diverso.

**`==` vs `===`?** `==` può applicare conversioni; `===` confronta senza coercizione di tipo.

**Cos'è una closure?** Funzione che conserva accesso alle variabili del contesto lessicale in cui è stata creata.

**Event loop?** Coordina stack di esecuzione, code di task e microtask (Promise callbacks): asincrono non significa necessariamente parallelo.

**Shallow copy?** Copia i valori delle proprietà di primo livello; gli oggetti annidati restano condivisi.

**Approfondisci quando serve:** [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) per scope, prototipi e tipi; [MDN — event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) per stack, task/microtask e asincronia.
