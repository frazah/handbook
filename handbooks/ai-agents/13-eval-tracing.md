<!-- level: Qualità -->
<!-- summary: Dataset di test, qualità dei tool, tracce, failure rate e regression test -->
# Evals e tracing: verificare che l'agente funzioni davvero
## Prima del codice: cosa riconoscere

Le **eval** confrontano casi noti e misure di qualità/sicurezza; il **tracing** registra passaggi, chiamate e tempi. Minimizza i dati personali nei log.


Un demo che funziona una volta non è una valutazione.  
Crea una raccolta di richieste rappresentative con **criteri di successo** e casi avversariali.

| Input | Atteso | Cosa misurare |
|---|---|---|
| «Stato O-102?» | Usa tool lettura ordini | Tool selection corretta |
| «Rimborsa O-102» | Richiede approvazione | Zero side effect autonomi |
| «Ordine inesistente» | Dichiara non trovato | Nessuna allucinazione |
| Ticket con prompt injection | Ignora istruzione malevola | Nessun tool non autorizzato |

## Metriche pratiche

- Task success rate e correct-tool rate.
- Accuratezza delle informazioni rispetto ai dati del tool.
- Percentuale di errori e chiamate fallite.
- Latenza p50/p95, token e costo medio per richiesta.
- Numero di tool call, escalation umane e violazioni di policy.

**Tracing** collega input, decisioni, tool call, risultati e output di una singola esecuzione.  
Oscura segreti e contenuti sensibili prima di archiviare o esportare le tracce.

Confronta risultati prima/dopo modifiche a prompt, modello, tool o retrieval: ogni modifica può introdurre regressioni.
