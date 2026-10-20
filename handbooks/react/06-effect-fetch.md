<!-- level: Intermedio -->
<!-- summary: useEffect, dipendenze, fetch, AbortController e gestione errori -->
# `useEffect`, richieste HTTP e cleanup

**Idea:** `useEffect` sincronizza il componente con un **sistema esterno** (rete, timer, WebSocket, librerie non React). Non usarlo per calcolare un valore derivabile da props e state.

## 1. Capire prima la firma di `useEffect`

```tsx
import { useEffect } from 'react';

function PageTitle() {
  useEffect(() => {
    // Questa callback viene eseguita dopo il render.
    document.title = 'Le mie attività';

    // Qui non servono risorse da ripulire.
  }, []); // []: nessuna dipendenza reattiva, salvo setup/cleanup extra in Strict Mode dev.

  return <h1>Attività</h1>;
}
```

`useEffect(setup, dependencies)` riceve una **funzione** (`setup`) e un array di **dipendenze**.

Se `setup` crea una risorsa da chiudere, restituisce una seconda funzione detta **cleanup**.

## 2. Un esempio HTTP reale, spiegato per passaggi

```tsx
import { useEffect, useState } from 'react';

type Task = {
  id: number;
  title: string;
};

function TaskFeed() {
  // Gli array tipizzati usano <Task[]>: gli elementi sono Task.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Permette di annullare la richiesta quando non serve più.
    const controller = new AbortController();

    async function loadTasks(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/tasks', {
          signal: controller.signal,
        });

        // fetch non lancia automaticamente per HTTP 404/500.
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Il JSON ricevuto è dato esterno: i tipi TS non lo validano.
        // Qui presumiamo il contratto API; in produzione usa validazione runtime.
        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Risposta API non valida');
        }

        if (!controller.signal.aborted) {
          setTasks(data as Task[]); // Solo esempio: NON controlla i campi interni.
        }
      } catch (cause) {
        // AbortError significa che la richiesta è stata annullata intenzionalmente.
        if (!controller.signal.aborted) {
          setError(String(cause));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTasks(); // Avviamo la Promise senza usarne il risultato direttamente.

    // Cleanup: si esegue quando il componente viene smontato
    // (e prima di eventuali nuovi setup dell'Effect).
    return () => controller.abort();
  }, []);

  if (loading) {
    return <p>Caricamento...</p>;
  }

  if (error !== null) {
    return <p role="alert">{error}</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

**Attenzione immediata:** `data as Task[]` è un'**asserzione di tipo**, non una validazione. Il controllo `Array.isArray` verifica solo che sia un array; per dati non fidati devi verificare anche `id` e `title` per ogni elemento (vedi il capitolo TypeScript sulle API).

## 3. Perché il cleanup conta

In Strict Mode, in sviluppo, React può eseguire un ciclo aggiuntivo setup/cleanup per verificare la correttezza degli effetti. Il codice deve tollerarlo; non cercare di «bloccare» l'Effect con trucchi.

Per applicazioni grandi, valutare il data loading del framework o una libreria query/cache spesso evita di reinventare cache, deduplicazione e stati di caricamento.

**Non serve un Effect** per `const active = tasks.filter(task => !task.done)`: il valore si calcola durante il render.
