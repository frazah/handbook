<!-- level: Qualità -->
<!-- summary: Endpoint FastAPI, schema, autorizzazione e frontend React -->
# Esporre un agente tramite FastAPI

Lo schema tipico: React → FastAPI → runtime agente → tool/DB.  
**La chiave del modello rimane sul server**.

**Prima di leggere il codice — simboli e termini:**

- ***LLM***: modello linguistico che produce testo o richieste strutturate, non automaticamente un agente.

## Prima del codice: cosa riconoscere

Esporre un agente tramite FastAPI implica gestire input, identità, permessi, timeout e possibili costi per richiesta. Evita che il client scelga arbitrariamente i tool abilitati.

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

# Pydantic definisce e valida la forma dei dati.
class Request(BaseModel):
    # Field aggiunge vincoli di validazione a un campo del modello.
    question: str = Field(min_length=1, max_length=500)

class Answer(BaseModel):
    text: str

@app.post("/ask", response_model=Answer)
async def ask(body: Request):
    # Esempio senza servizio LLM: sostituire con un agente dopo
    # autenticazione, rate limit, autorizzazione e osservabilità.
    return Answer(text=f"Richiesta ricevuta ({len(body.question)} caratteri)")
```

Non inserire in `system` informazioni sensibili appartenenti ad altri utenti.  
Il tool deve usare l'identità verificata nel backend, **non un user_id suggerito dal modello**.

Per la UI: separa `loading`, `error`, `needs_approval` e `completed`; non mostrare una transazione come conclusa prima della conferma del backend.
