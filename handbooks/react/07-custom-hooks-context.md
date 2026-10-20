# Custom Hooks e Context

**Idea.** I custom hook estraggono logica che usa altri hook, non condividono automaticamente lo stesso stato tra le diverse chiamate.
Context evita il passaggio manuale di props in profondità.

**Prima di leggere il codice — simboli e termini:**

- **`JSX`**: sintassi simile a HTML dentro JavaScript: descrive gli elementi UI.
- **`useState`**: Hook che conserva una variabile di stato fra i render.
- **`useEffect`**: Hook per sincronizzarsi con sistemi **esterni**; non per ricalcolare valori derivati.

```tsx
import { useEffect, useState } from 'react';

function useOnlineStatus() {
  // Lo stato persiste tra i render: aggiornalo con la funzione setter.
  const [online, setOnline] = useState(navigator.onLine);
  // Sincronizza una risorsa esterna; la callback può restituire una cleanup.
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}
```

## Context per impostazioni condivise

```tsx
import { createContext, useContext } from 'react';
const ThemeContext = createContext<'light' | 'dark'>('light');
function ThemeLabel() {
  const theme = useContext(ThemeContext);
  return <span>Tema: {theme}</span>;
}
// <ThemeContext.Provider value="dark"><ThemeLabel /></ThemeContext.Provider>
```

**Regole degli hook:** chiamali al livello superiore dei componenti/custom hook, non dentro condizioni o cicli.  
Se vuoi fare SSR, evita `navigator` durante il render: inizializza uno stato sicuro e leggi il browser dopo il mount.
