<!-- level: Progetto -->
<!-- summary: import/export, type-only import, tsconfig strict, ESM Node e gestione degli errori -->
# Moduli, errori e configurazione TypeScript

Un **modulo** è un file con almeno un `import` oppure un `export`.

Separare i file aiuta a mantenere i tipi di dominio vicini alle funzioni che li utilizzano e rende il progetto più facile da testare.

## 1. `export` e `import`: due file diversi

**File `prices.ts`** — pubblica un tipo e una funzione.

```ts
// "export type" rende disponibile il tipo agli altri file.
export type Money = {
  amount: number;
  currency: 'EUR' | 'USD';
};

// Questa è invece una funzione vera, presente anche a runtime.
export function withTax(net: Money, rate = 0.22): Money {
  // Convertiamo in centesimi prima di arrotondare a due decimali.
  const gross = Math.round(net.amount * (1 + rate) * 100) / 100;

  // Copiamo gli altri campi (come currency) e sostituiamo amount.
  return { ...net, amount: gross };
}
```

**File `main.ts`** — importa ciò che serve e lo utilizza.

```ts
// "type" importa solo il contratto; "withTax" è codice eseguibile.
import { withTax, type Money } from './prices.js';

const net: Money = {
  amount: 20,
  currency: 'EUR',
};

console.log(withTax(net)); // { amount: 24.4, currency: 'EUR' }
```

**Attenzione immediata all'import:** il suffisso `.js` rappresenta il file JavaScript generato nel contesto ESM di Node.js con `NodeNext`.

La sintassi degli import cambia con l'ambiente: un progetto Vite/browser spesso usa una risoluzione `Bundler`.

Questi due blocchi vanno messi in **due file distinti**, non incollati in sequenza nello stesso file.

## 2. `tsconfig.json`: cosa controlla

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  }
}
```

- `target`: versione JavaScript emessa dal compilatore.
- `module` / `moduleResolution`: regole per emissione e risoluzione dei moduli.
- `strict`: abilita vari controlli importanti sui tipi.
- `noUncheckedIndexedAccess`: gli accessi tramite chiavi o indici incerti possono restituire anche `undefined`.
- `skipLibCheck`: evita il controllo approfondito dei file di dichiarazione delle librerie; non valida il tuo codice.

**Attenzione:** la configurazione `NodeNext` va abbinata a un setup ESM coerente, ad esempio `"type": "module"` in `package.json`.

Per un nuovo progetto frontend con Vite preferisci la configurazione generata dal template e modificane solo le parti che comprendi.

## 3. Errore di tipo vs errore in esecuzione

```ts
// Errore TypeScript: il compilatore lo rileva prima del run.
// const price: number = '20';

// Errore runtime: il dato arriva dall'esterno e va verificato.
function parsePrice(raw: unknown): number {
  const value = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Prezzo non valido');
  }
  return value;
}
```

**Ricorda:** `tsc --noEmit` controlla i tipi, ma non esegue i test e non valida automaticamente JSON esterni.
