# Tipi, union e narrowing

**Idea.** Una *union* ammette più tipi; prima di chiamare metodi specifici devi restringere (*narrowing*) il tipo.
Preferisci `unknown` a `any` quando il valore non è noto.

**Prima di vedere il codice:** il simbolo `|` in un tipo significa «oppure».

`string | number` indica un valore che può essere una stringa oppure un numero; il controllo `typeof` permette a TypeScript di sapere quale caso sta gestendo.

```ts
// I tipi descrivono il contratto; le istruzioni restano JavaScript a runtime.
type OrderStatus = 'pending' | 'paid' | 'shipped';

type Search = string | number;

function normalizeSearch(query: Search): string {
  // Prima restringiamo la union: se è un numero, lo convertiamo.
  if (typeof query === 'number') {
    return String(query);
  }

  // In questo punto TypeScript sa che query è una stringa.
  return query.trim().toLowerCase();
}

function parseError(input: unknown): string {
  // unknown obbliga a controllare prima di leggere .message.
  if (input instanceof Error) {
    return input.message;
  }

  return String(input);
}
```

## Union discriminata: casi reali

```ts
// I tipi descrivono il contratto; le istruzioni restano JavaScript a runtime.
type CardPayment = {
  kind: 'card';
  last4: string;
};

type BankPayment = {
  kind: 'bank';
  iban: string;
};

// Union discriminata: due forme possibili, distinte dal campo kind.
type Payment = CardPayment | BankPayment;

function labelPayment(payment: Payment): string {
  switch (payment.kind) {
    case 'card': {
      // TypeScript sa che in questo ramo esiste last4.
      return `Carta •••• ${payment.last4}`;
    }
    case 'bank': {
      // In questo ramo è disponibile iban.
      return `Bonifico ${payment.iban}`;
    }
  }
}
```

**Distinzione:** `null` indica un valore intenzionalmente assente, `undefined` spesso una proprietà non fornita.  
Con `strictNullChecks`, entrambi richiedono gestione esplicita.

**Errore comune:** `as string` non converte e non valida; è un'affermazione rivolta al compilatore.
