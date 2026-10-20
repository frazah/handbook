<!-- level: Qualità -->
<!-- summary: Retry, timeout, limiti, osservabilità e controllo del budget -->
# Agenti in produzione: latenza, costi e affidabilità

## Il budget è un requisito tecnico

Costi ≈ token input + token output + eventuali tool/servizi esterni.  
Un agente che cicla senza controllo può consumare chiamate inutili.

## Strategie

- Limite di passi, chiamate tool e durata per richiesta.
- Timeout e retry con backoff sui fallimenti transitori; **mai** ripetere una scrittura non idempotente senza controlli.
- Cache delle risposte solo quando dati e permessi lo consentono.
- Tool outputs corti e mirati, non interi database.
- Fallback verso operatore o workflow deterministico.
- Separazione fra logging tecnico e dati riservati.

**Prima di leggere il codice — simboli e termini:**

- ***Tool calling***: il modello propone un’azione, ma il codice dell’app la valida e la esegue.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from dataclasses import dataclass

@dataclass
class RunBudget:
    remaining_tool_calls: int = 4

    def consume(self):
        if self.remaining_tool_calls <= 0:
            raise RuntimeError("Budget tool esaurito")
        self.remaining_tool_calls -= 1

budget = RunBudget()
budget.consume()
```

In un backend FastAPI, non esporre la chiave API al browser: mantienila nel server.  
Applica autenticazione, rate limiting, gestione errori e metriche.
