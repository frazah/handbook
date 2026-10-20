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
  if (typeof query === 'number') return String(query);
  return query.trim().toLowerCase(); // qui TS sa che è string
}

function parseError(input: unknown): string {
  if (input instanceof Error) return input.message;
  return String(input);
}
```

## Union discriminata: casi reali

```ts
// I tipi descrivono il contratto; le istruzioni restano JavaScript a runtime.
type Payment =
  | { kind: 'card'; last4: string }
  | { kind: 'bank'; iban: string };

function labelPayment(p: Payment) {
  switch (p.kind) {
    case 'card': return `Carta •••• ${p.last4}`;
    case 'bank': return `Bonifico ${p.iban}`;
  }
}
```

**Distinzione:** `null` indica un valore intenzionalmente assente, `undefined` spesso una proprietà non fornita.  
Con `strictNullChecks`, entrambi richiedono gestione esplicita.

**Errore comune:** `as string` non converte e non valida; è un'affermazione rivolta al compilatore.
