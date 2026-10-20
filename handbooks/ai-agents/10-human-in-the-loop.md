<!-- level: Orchestrazione -->
<!-- summary: Approvazione umana e tool con effetti reali -->
# Human-in-the-loop per operazioni con effetti reali

Un agente può *proporre* un'azione, ma un'azione su soldi, file, email, dati sensibili o sistemi esterni deve essere governata dal backend.

## Prima del codice: cosa riconoscere

**Human-in-the-loop** richiede approvazione prima di azioni critiche. Un messaggio «sei sicuro?» scritto dal modello non equivale a un controllo di autorizzazione verificato dal server.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class RefundRequest:
    order_id: str
    amount_cents: int
    requested_by: str

def propose_refund(order_id, amount_cents, user_id):
    if amount_cents <= 0 or amount_cents > 10_000:
        raise ValueError("Importo non valido")
    return RefundRequest(order_id, amount_cents, user_id)

proposal = propose_refund("O-102", 1500, "u-17")
print("PROPOSTA, NON RIMBORSO:", proposal)
# L'esecuzione richiede autenticazione, controllo titolarità ordine,
# verifica policy, approvazione prevista, idempotenza e log.
```

L'approvazione non è un semplice «sì» scritto nella conversazione: una UI verificabile mostra **azione, destinatario e importo esatti**.  
Il backend controlla di nuovo i permessi e usa una chiave di idempotenza per evitare doppi invii.

**Regola:** un tool `refund()` non va esposto all'agente solo perché è tecnicamente disponibile.
