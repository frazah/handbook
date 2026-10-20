<!-- level: Fondamenti -->
<!-- summary: Come leggere JavaScript: funzioni, destructuring, callback, closure, Promise e browser -->
# Prima di JavaScript avanzato: guida alla sintassi

Questa guida serve a decifrare le forme abbreviate più comuni prima di ritrovarle negli esempi del corso.
I file `.js` dell'handbook sono anche eseguibili: i commenti fanno parte della spiegazione.

## 1. Arrow function: dalla forma estesa alla forma breve

```js
// Versione estesa: una funzione con nome.
function double(number) {
  return number * 2;
}

// Versione assegnata a una variabile.
const doubleArrow = (number) => {
  return number * 2;
};

// Corpo abbreviato: senza { }, il valore viene restituito implicitamente.
const doubleShort = (number) => number * 2;

console.log(double(4), doubleArrow(4), doubleShort(4));
```

`=>` non indica di per sé asincronia: è solo sintassi di una funzione.

## 2. Callback e metodi degli array

```js
const prices = [10, 20, 30];

// Callback: la funzione viene passata a map, non chiamata immediatamente da noi.
function addTax(price) {
  return price * 1.22;
}

const grossPrices = prices.map(addTax);

// Equivalente con callback inline:
const sameResult = prices.map((price) => {
  return price * 1.22;
});

console.log(grossPrices, sameResult);
```

`map` crea un **nuovo array**; `forEach` esegue un'operazione per elemento e non serve a costruire un array di risultati.

## 3. Destructuring e spread non sono lo stesso concetto

```js
const product = {
  id: 'P-1',
  title: 'Libro',
  price: 20,
};

// Destructuring: estrae proprietà esistenti.
const { title, price } = product;

// Spread: copia superficialmente le proprietà in un nuovo oggetto.
const discounted = {
  ...product,
  price: 18,
};

console.log(title, price, discounted);
```

`{ title, price }` a sinistra di `=` estrae campi. `{ ...product }` in un letterale crea un nuovo oggetto con le proprietà copiate.
La copia è **superficiale**: eventuali oggetti annidati rimangono condivisi.

## 4. Closure e funzioni che ritornano funzioni

```js
function createCounter() {
  let value = 0;

  // Questa funzione legge value anche dopo che createCounter è terminata.
  function increment() {
    value += 1;
    return value;
  }

  return increment;
}

const next = createCounter();
console.log(next()); // 1
console.log(next()); // 2
```

La *closure* è il mantenimento dell'accesso all'ambiente lessicale della funzione, non la copia del valore `value`.

## 5. Promise e `async` / `await`

```js
async function loadOrder() {
  try {
    // L'await sospende questa funzione fino alla risposta.
    const response = await fetch('/api/orders/42');

    // Un errore HTTP 404 NON fa fallire automaticamente fetch.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Anche il parsing JSON restituisce una Promise.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Impossibile caricare l’ordine', error);
    throw error;
  }
}
```

**Questo frammento richiede un browser (o un ambiente con `fetch`) e un endpoint `/api/orders/42`: non è autonomo.**
`await` si usa dentro una funzione `async` o al livello superiore di un modulo che lo supporta.

## 6. Browser e Node.js

I file che usano `document`, `window`, DOM e form vanno provati in un browser.
I file che usano solo i costrutti del linguaggio possono essere avviati dal terminale con `node nome-file.js`.
Non eseguire codice browser nel terminale aspettandoti che `document` esista.
