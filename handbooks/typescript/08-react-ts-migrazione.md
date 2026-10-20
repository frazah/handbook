<!-- level: Progetto -->
<!-- summary: Tipizzare React con .tsx, props, eventi e una migrazione progressiva -->
# TypeScript con React e migrazione da JavaScript

I file **`.tsx`** contengono JSX (tag simili all'HTML) insieme a TypeScript.

Per iniziare, tipizza **props, eventi e risposte delle API** e lascia che TypeScript inferisca i tipi ovvi.

## 1. Props di un componente

```tsx
// Il contratto specifica quali props accetta il bottone.
type ButtonProps = {
  label: string;
  loading?: boolean;  // "?" = prop opzionale
  onClick: () => void; // callback senza valore di ritorno significativo
};

export function ActionButton({ label, loading = false, onClick }: ButtonProps) {
  return <button onClick={onClick} disabled={loading}>{label}</button>;
}
```

`loading = false` fornisce il default se la prop manca; non modifica l'oggetto delle props ricevuto dal genitore.

## 2. Stato ed eventi di un input

Questo esempio è **indipendente** dal bottone sopra e può stare in un altro file `.tsx`.

```tsx
import { useState, type ChangeEvent } from 'react';

function EmailField() {
  // La stringa iniziale permette di inferire il tipo dello stato.
  const [email, setEmail] = useState('');

  // L'evento proviene da un elemento <input> del DOM.
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  };

  return <input type="email" value={email} onChange={change} />;
}
```

`ChangeEvent<HTMLInputElement>` è un **generic**: fra le parentesi angolari `<...>` specifichi il tipo dell'elemento da cui arriva l'evento.

`ChangeEvent` è un *tipo React*, non la classe `Event` del DOM nativo.

`import type` (o `type` dentro l'import) importa solo informazioni per il type checker, non una funzione utilizzabile a runtime.

## 3. Migrare gradualmente un progetto JS

1. Abilita il controllo dei tipi sul progetto e verifica i dati ai confini delle API.
2. Converti i moduli senza JSX in `.ts`.
3. Converti i componenti React in `.tsx` e tipizza prima props e callback.
4. Riduci gradualmente gli `any` superflui, verifica `tsc --noEmit` e mantieni test funzionali.

**Attenzione:** non usare `as` per nascondere ogni errore; molto spesso segnala che il modello dei dati va corretto o che manca una validazione runtime.
