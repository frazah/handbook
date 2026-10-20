# Fetch, Promise e validazione dei dati

**Idea.** Il tipo generico dichiarato per un'API non prova la correttezza dei dati di rete.
Considera `response.json()` come `unknown` e controlla la struttura.

**Prima di leggere il codice — simboli e termini:**

- **`Promise<T>`**: operazione asincrona che produce un risultato di tipo `T`.
- **`as T`**: asserzione per il type checker: non valida i dati a runtime.

```ts
type Task = { id: number; title: string; completed: boolean };

function isTask(value: unknown): value is Task {
  // Prima escludiamo null e i valori primitivi.
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Dopo il controllo possiamo leggere proprietà dinamiche come unknown.
  const obj = value as Record<string, unknown>;

  // Controlliamo davvero tutti i campi richiesti dal modello Task.
  return (
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean'
  );
}

async function getTask(id: number): Promise<Task> {
  // Attende la risposta HTTP prima di usare i dati.
  const res = await fetch(`/api/tasks/${id}`);
  // Verifica lo stato HTTP: fetch non genera eccezioni per 404 e 500.
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // Non fidarti ciecamente del JSON: TypeScript non valida la rete.
  const data: unknown = await res.json();

  if (!isTask(data)) {
    throw new Error('Risposta API non valida');
  }

  // Il type guard ha ristretto unknown a Task.
  return data;
}
```

**Perché `value is Task`?** È un *type predicate*: quando `isTask(value)` restituisce `true`, TypeScript considera `value` compatibile con `Task`.

Il predicato è affidabile **solo se** la funzione controlla davvero i campi necessari a runtime.

**Quando usarlo:** API, localStorage, input importati.  
Per modelli complessi puoi usare uno schema validator (per es. Zod), con dipendenza da installare.

**Errore comune:** `fetch` non rigetta automaticamente per HTTP 404 o 500: verifica `res.ok`.
