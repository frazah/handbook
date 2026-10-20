# Form e input controllati

**Idea.** Un campo *controlled* prende il valore da state e lo aggiorna in `onChange`.
Usalo per controllare validazione, pulsanti e feedback.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`useState`**: Hook che conserva una variabile di stato fra i render.

```tsx
import { useState, type FormEvent } from 'react';

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  // Lo stato persiste tra i render: aggiornalo con la funzione setter.
  const [title, setTitle] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = title.trim();
    if (!cleaned) return;
    onAdd(cleaned);
    setTitle('');
  }
  return <form onSubmit={submit}>
    <label htmlFor="title">Attività</label>
    <input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
    <button type="submit">Aggiungi</button>
  </form>;
}
```

**Attenzione:** usa `<label>` e validazione lato server quando invii dati a un backend. `required` non sostituisce verifiche di sicurezza.

**Errore comune:** non eseguire `preventDefault()` e vedere la pagina ricaricarsi dopo il submit.
