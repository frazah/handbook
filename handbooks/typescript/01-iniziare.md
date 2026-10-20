# Perché TypeScript e come avviarlo

**Idea.** TypeScript è JavaScript con un sistema di tipi *statico*: trova errori durante sviluppo/compilazione, ma il codice eseguito rimane JavaScript.
**I tipi non validano i dati a runtime** (es.
JSON ricevuto via rete).

## Avvio minimo

```bash
# Esegui i comandi dalla cartella del progetto.
mkdir demo-ts && cd demo-ts
npm init -y
npm install --save-dev typescript
npx tsc --init
npx tsc --noEmit        # verifica senza produrre .js
```

Nella configurazione abilita `"strict": true`; se usi i moduli moderni adegua anche `module`, `target` e `moduleResolution` al progetto (browser o Node).

## Inferenza e annotazioni

```ts
// Inferenza: TypeScript deduce che questa costante è un numero.
const shippingPrice = 6.90;

// Union: il valore può essere una stringa OPPURE null.
let coupon: string | null = null;

function total(
  price: number,
  quantity: number,
): number {
  // price e quantity sono input; : number dopo ) è il tipo di ritorno.
  const subtotal = price * quantity;
  return subtotal + shippingPrice;
}

// Richiamiamo la funzione con due numeri.
console.log(total(14.50, 2));
// total("14", 2) → errore in compilazione
```

**Quando usarlo:** su app e API dove cambiano struttura dei dati, proprietà e refactoring.  
**Ricorda:** `tsc` non aggiunge controlli runtime; annotare `number` non converte una stringa.

**Errore comune:** pensare che TypeScript sostituisca i test.
I test verificano il comportamento, i tipi la compatibilità statica.
