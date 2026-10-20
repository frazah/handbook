<!-- level: Costruzione -->
<!-- summary: Schemi Pydantic, dati validi, parsing e fallback -->
# Output strutturato: dal testo libero a uno schema

Per usare una risposta nel software preferisci un **oggetto tipizzato**, non un paragrafo da interpretare con regex.

```python
from typing import Literal
from pydantic import BaseModel, Field

# Pydantic definisce e valida la forma dei dati.
class SupportDecision(BaseModel):
    intent: Literal["order_status", "refund", "other"]
    confidence: float = Field(ge=0, le=1)
    needs_human: bool
    answer: str

# Esempio locale di validazione, senza chiamare un modello:
payload = {"intent": "refund", "confidence": 0.87,
           "needs_human": True, "answer": "Richiesta da verificare"}
print(SupportDecision.model_validate(payload))
```

## Perché serve?

Un frontend React può mostrare bottoni in base a `intent`; un backend FastAPI può validare risposte via Pydantic; un'automazione può bloccare output mancanti.

**Attenzione:** una risposta **conforme allo schema non è necessariamente vera**.
Valida anche dati e permessi.
Non usare `confidence` generata dal modello come probabilità calibrata senza un'analisi empirica.
