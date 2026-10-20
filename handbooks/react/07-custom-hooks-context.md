<!-- level: Intermedio -->
<!-- summary: Custom hook, effect cleanup, Context provider e useContext -->
# Custom Hook e Context

**Idea:** un *custom hook* è una funzione il cui nome inizia con `use` e che può chiamare altri hook. Estrae **logica riutilizzabile**, ma ogni utilizzo mantiene il proprio stato.

## 1. Un custom hook: stato online/offline

```tsx
import { useEffect, useState } from 'react';

function useOnlineStatus(): boolean {
  // Valore iniziale neutro; non accediamo a navigator durante un render SSR.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Il browser è disponibile dentro useEffect, dopo il mount sul client.
    setOnline(navigator.onLine);

    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rimuoviamo i listener per evitare registrazioni duplicate.
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

function StatusBadge() {
  const online = useOnlineStatus();

  return (
    <span>{online ? 'Online' : 'Offline'}</span>
  );
}
```

**Nota SSR:** il primo render mostra il default `true`; dopo il mount si sincronizza con il browser. Se questa differenza è rilevante, scegli un fallback UI esplicito o valuta `useSyncExternalStore`.

## 2. Context: evitare di passare la stessa prop a molti livelli

```tsx
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Una union: il tema può essere SOLO una di queste due stringhe.
type Theme = 'light' | 'dark';

// createContext<Theme> usa un parametro di tipo.
// 'light' è il valore di fallback se manca un provider.
const ThemeContext = createContext<Theme>('light');

type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeProvider(props: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value="dark">
      {props.children}
    </ThemeContext.Provider>
  );
}

function ThemeLabel() {
  // useContext legge il valore del provider più vicino.
  const theme = useContext(ThemeContext);

  return <span>Tema corrente: {theme}</span>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemeLabel />
    </ThemeProvider>
  );
}
```

**Attenzione:** il valore `createContext('light')` è un **fallback**, non sostituisce una gestione consapevole dell'assenza di provider. Per context obbligatori puoi inizializzare con `null` e lanciare un errore in un custom hook se manca il provider.

## 3. Regole degli hook

Chiama gli hook **solo al livello superiore** di componenti React o custom hook: non dentro `if`, cicli o funzioni annidate. L'ordine delle chiamate deve essere stabile tra i render.
