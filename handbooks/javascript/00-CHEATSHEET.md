# JavaScript — Cheatsheet per consultazione rapida

## Tipi e condizioni

| Necessita' | Sintassi | Nota |
|---|---|---|
| Variabile | `const x = 1;` / `let y = 2;` | `const` non rende immutabile l'oggetto |
| Tipo | `typeof x` | `typeof null === 'object'` (bug storico) |
| Uguaglianza | `a === b` / `a !== b` | evita `==` salvo casi voluti |
| Default nullish | `x ?? fallback` | solo `null` o `undefined` |
| Default falsy | `x || fallback` | anche `0`, `false`, `''` |
| Optional access | `obj?.prop?.x` | non protegge da identificatori non dichiarati |
| Ternario | `ok ? a : b` | espressione, non blocco |
| Template literal | `` `Ciao ${name}` `` | supporta multilinea |
| Convertire | `Number('42')`, `String(42)`, `Boolean(x)` | conversione esplicita |

## Funzioni, array, oggetti

| Obiettivo | Scrivi | Ritorna/muta? |
|---|---|---|
| Funzione | `const f = (x) => x * 2;` | valore di `return` |
| Default argomento | `function f(x = 0) {}` | default solo se `undefined` |
| Rest | `function f(...args) {}` | raccoglie in array |
| Spread | `f(...arr)`, `[...arr]`, `{...obj}` | espande/copia shallow |
| Trasformare array | `arr.map(f)` | **nuovo** array |
| Filtrare | `arr.filter(f)` | **nuovo** array |
| Cercare | `arr.find(f)` / `findIndex(f)` | valore / indice |
| Accumulare | `arr.reduce((a, x) => a + x, 0)` | singolo valore |
| Testare | `arr.some(f)` / `arr.every(f)` | boolean |
| Ordinare | `arr.toSorted((a,b) => a-b)` | nuovo array (moderno) |
| Ordinare mutando | `arr.sort((a,b) => a-b)` | **muta** array |
| Estrarre | `arr.slice(1, 3)` | non muta |
| Rimuovere/inserire | `arr.splice(1, 1, x)` | **muta** array |
| Chiavi/valori/coppie | `Object.keys/values/entries(obj)` | array |
| Clonare oggetto | `{...obj}` | copia shallow |
| Clonare strutture compatibili | `structuredClone(obj)` | copia deep con limiti |
| Destructuring | `const {name, age} = user;` | assegna variabili |
| Eredita prototipo | `Object.create(proto)` | oggetto nuovo |

## `this`, OOP e moduli

```js
const obj = { x: 1, getX() { return this.x; } };
obj.getX();                // 1
obj.getX.bind(obj)();      // 1 (this fissato)
class A { #x = 1; get x() { return this.#x; } }
// File A: export const square = x => x * x;
// File B: import { square } from './a.mjs';
```

## Asincronia

```js
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run() {
  try {
    const [one, two] = await Promise.all([job1(), job2()]); // parallele
  } catch (error) { console.error(error); }
}
// Promise.all -> tutti o primo errore; allSettled -> tutti gli esiti
// Promise.any -> primo successo; race -> primo esito (anche errore)
// fetch HTTP 404: response.ok e' false, ma normalmente non rigetta Promise
```

## Browser

```js
const el = document.querySelector('#id');
el.textContent = 'Sicuro';            // testo, non HTML
el.classList.toggle('active');
el.addEventListener('click', event => console.log(event.target));
const form = new FormData(document.querySelector('form'));
const response = await fetch('/api/items');
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
localStorage.setItem('theme', 'dark');
```

## Stringhe, numeri, date, regex

```js
' JavaScript '.trim().includes('Script'); // true
'1,2,3'.split(',');                      // ['1','2','3']
Number.parseInt('20px', 10);             // 20
(3.14159).toFixed(2);                   // '3.14' (stringa)
new Date('2026-10-19T12:00:00Z').toISOString();
'a1 b2'.match(/\d/g);                   // ['1','2']
```

## Errori classici

- `arr1 === arr2` confronta il riferimento, non i valori.
- `Array.sort()` senza comparatore confronta stringhe.
- `NaN === NaN` e' false; usa `Number.isNaN()`.
- `0 || 10` e' 10, ma `0 ?? 10` e' 0.
- `JSON.stringify` non supporta cicli, BigInt di default e molti tipi speciali.
- `console.log()` mostra; `print()` nel browser generalmente apre la finestra di stampa.
- `for...in` itera chiavi; `for...of` valori di iterabili.
- `map()` crea un array; `forEach()` restituisce `undefined`.
- `innerHTML` con input non fidato espone a XSS: usa `textContent`.
- `fetch()` con status HTTP 4xx/5xx non e' automaticamente un errore Promise.
- In strict mode `this` in funzione libera puo' essere `undefined`.

## Dove cercare

`Ctrl+P` in VS Code per cercare il nome di file; `Ctrl+Shift+F` per ricerca in tutto il progetto.  
Nel lettore HTML usa la ricerca (titoli + codice) e la navigazione tra capitoli.

---

## Operatori, cicli e controllo di flusso

| Obiettivo | Sintassi | Nota |
|---|---|---|
| Condizione | `if (ok) { ... } else { ... }` | blocchi separati |
| Casi | `switch (status) { case 'paid': break; default: }` | ricorda `break` |
| Iterare valori | `for (const item of items) { ... }` | array, stringhe e iterabili |
| Iterare proprietà | `for (const key in obj) { ... }` | attenzione alle proprietà ereditate |
| Chiavi di un oggetto | `Object.entries(obj)` | coppie `[key, value]` |
| Continuare/interrompere | `continue` / `break` | nei cicli |
| Confronto identità | `===` / `!==` | oggetti confrontati per riferimento |
| Tipo di valore | `typeof value` / `Array.isArray(value)` | `null` va gestito |
| Gestire eccezioni | `try { ... } catch (err) { ... } finally { ... }` | `finally` anche con errore |
| Sollevare errore | `throw new Error('...')` | utile per validazioni |

## Collezioni e sintassi moderna

```js
// Map usa chiavi di qualunque tipo; Set conserva valori unici.
const ages = new Map([['Ada', 28]]);
const unique = new Set(['js', 'js', 'ts']);

// Destructuring e default: estrai proprietà senza ripetere user.name.
const user = { name: 'Ada', role: 'developer' };
const { name, role = 'guest' } = user;

// Copia superficiale: gli oggetti annidati restano condivisi.
const cloned = { ...user };

// Accumula una somma senza modificare prices.
const prices = [9, 14, 7];
const total = prices.reduce((sum, price) => sum + price, 0);
```

| Metodo | Uso rapido |
|---|---|
| `arr.at(-1)` | ultimo elemento |
| `arr.includes(x)` | cerca presenza |
| `arr.find(x => ...)` | primo elemento corrispondente |
| `arr.flat(2)` | appiattisce livelli |
| `arr.toSorted((a,b) => a-b)` | ordinamento senza mutazione |
| `Object.fromEntries(entries)` | coppie → oggetto |
| `Object.hasOwn(obj, key)` | proprietà diretta |
| `str.replaceAll('a','b')` | sostituisce tutte le occorrenze letterali |
| `Number.isFinite(n)` | numero finito e non NaN |

## Async, moduli e DOM: pattern di lavoro

```js
// Un singolo await attende un risultato.
const res = await fetch('/api/tasks'); // all'interno di una funzione async o modulo
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const tasks = await res.json(); // valuta/valida i dati prima di fidartene
```

```js
// Evento delegato: un listener gestisce più bottoni figli.
document.querySelector('#list')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  console.log(button.dataset.id);
});
```

**Ricorda:** `await` richiede un contesto compatibile; `Promise.all` è utile per richieste concorrenti indipendenti; `localStorage` conserva stringhe e non è un deposito per segreti.
