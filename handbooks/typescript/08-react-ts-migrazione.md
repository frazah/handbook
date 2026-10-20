<!-- level: Progetto -->
<!-- summary: File TSX, tipi di props e callback, eventi React e migrazione progressiva -->
# TypeScript in React: props, callback e migrazione

**Prima di iniziare:** leggi `00a-come-leggere-la-sintassi.md` e il capitolo React `00a-come-leggere-tsx.md`.

Un file **`.tsx`** contiene TypeScript e JSX (tag simili all'HTML).

## 1. Prima la prop più semplice

```tsx
// Contratto dati del componente: la prop è obbligatoria.
type GreetingProps = {
  name: string;
};

function Greeting(props: GreetingProps) {
  return (
    <h2>Ciao, {props.name}!</h2>
  );
}

function App() {
  return <Greeting name="Ada" />;
}
```

`props` è **l'oggetto ricevuto**; `GreetingProps` è **il tipo usato dal compilatore**. Non sono due oggetti diversi.

## 2. Aggiungiamo una callback, un concetto per volta

Una callback è una funzione **passata come dato** al componente. Il tipo descrive quale funzione è accettata.

```ts
// TIPO di una funzione: riceve un ID stringa.
// void significa che chi la chiama non usa il valore restituito.
type BuyCallback = (productId: string) => void;

// IMPLEMENTAZIONE di una funzione con quella firma.
function buyProduct(productId: string): void {
  console.log('Acquisto del prodotto:', productId);
}

const onBuy: BuyCallback = buyProduct;
```

I due `=>` non sono identici a livello concettuale: nel **tipo** `=> void` specifica il risultato; in una **arrow function** `=> { ... }` introduce il corpo eseguibile.

Ora passiamo la callback al componente:

```tsx
type BuyButtonProps = {
  productId: string;
  disabled?: boolean; // La prop può mancare.
  onBuy: (productId: string) => void; // Prop contenente una funzione.
};

function BuyButton(props: BuyButtonProps) {
  function handleClick() {
    // Chiamata al click, NON durante il render.
    props.onBuy(props.productId);
  }

  return (
    <button
      type="button"
      disabled={props.disabled ?? false}
      onClick={handleClick}
    >
      Compra
    </button>
  );
}
```

`disabled ?? false` usa `false` soltanto se `disabled` è `null` o `undefined`; `onClick={handleClick}` passa il riferimento alla funzione.

**Da evitare negli esempi introduttivi:**

```tsx
// Sintassi valida ma TROPPO compatta per imparare:
// function BuyButton({ onBuy }: { onBuy: (id: string) => void }) { ... }
```

## 3. Input controllato ed evento tipizzato

*Questo è un componente indipendente dai precedenti.*

```tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

function EmailField() {
  // TS deduce che "email" è stringa dal valore iniziale ''.
  const [email, setEmail] = useState('');

  // ChangeEvent<HTMLInputElement> descrive l'evento di un input.
  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    // currentTarget: elemento a cui è associato l'handler.
    // value: stringa scritta nell'input.
    setEmail(event.currentTarget.value);
  }

  return (
    <label>
      Email
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
      />
    </label>
  );
}
```

**Che cos'è `<HTMLInputElement>`?** È un **argomento di tipo** passato al generic `ChangeEvent<T>`. Specifica che l'evento è relativo a un elemento input. Non è un tag JSX.

## 4. Destructuring: passo facoltativo, non obbligatorio

```tsx
type BadgeProps = {
  text: string;
};

// Prima: leggibile anche senza conoscere destructuring.
function BadgeA(props: BadgeProps) {
  return <span>{props.text}</span>;
}

// Dopo: usiamo destructuring per estrarre "text".
function BadgeB({ text }: BadgeProps) {
  return <span>{text}</span>;
}
```

`{ text }` è JavaScript che estrae la proprietà; `: BadgeProps` è un'annotazione TypeScript dell'**intero parametro**.

## 5. Migrazione graduale da JavaScript

1. Abilita `strict` e usa la configurazione suggerita dal framework React (ad esempio Vite).
2. Converti prima funzioni e modelli senza JSX da `.js` a `.ts`.
3. Converti i componenti da `.jsx` a `.tsx`; inizia dai **tipi di props**.
4. Tipizza callback, eventi e risposte API; valida davvero i dati esterni.
5. Riduci gli `any` e fai `npx tsc --noEmit` insieme ai test.

**Attenzione:** `as User` e `!` possono nascondere problemi al type checker; non validano né rendono sicuri dati runtime.
