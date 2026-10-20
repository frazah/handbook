# Autenticazione, CORS e configurazione

**Idea.** Autenticazione = *chi sei*; autorizzazione = *cosa puoi fare*.
Token firmati non significano automaticamente permessi corretti.
CORS è una regola del browser, **non** un sostituto dell'autenticazione.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)
```

## Pratiche minime
- Non hardcodare chiavi, password o token nel codice; usa variabili d'ambiente/secrets manager.
- Verifica autorizzazione **su ogni risorsa** (`/users/{id}` non basta autenticare il login).
- Usa TLS/HTTPS in deploy, hashing password adeguato, logging senza dati sensibili.
- Limita payload e rate delle API esposte; valida i dati e usa query parametrizzate.
- In produzione definisci host consentiti, proxy affidabili e politica CORS stretta.

**Errore comune:** `allow_origins=['*']` insieme a credenziali e poi considerare il servizio sicuro.
Origini e credenziali vanno progettate esplicitamente.
