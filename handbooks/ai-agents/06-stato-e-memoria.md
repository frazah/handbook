<!-- level: Costruzione -->
<!-- summary: Cronologia, sessioni, preferenze e gestione dei dati personali -->
# Sessioni e memoria: che cosa conservare?

La **history** è la lista dei messaggi precedenti; la **memory** può includere preferenze e risultati persistenti.  
Sono entrambe diverse dalla fonte autorevole (per esempio il DB ordini).

## Prima del codice: cosa riconoscere

**Sessione** e **memoria** non sono sinonimi: la sessione è il contesto di una conversazione, la memoria può essere mantenuta oltre. Imposta scadenza, permessi e minimizzazione dei dati.

```python
# Il database applicativo resta fonte di verità:
session = {
    "user_id": "u-17",
    "messages": [
        {"role": "user", "content": "Dov'è l'ordine O-102?"},
        {"role": "assistant", "content": "Verifico il suo stato."},
    ],
    "last_order_id": "O-102",  # preferenza temporanea, non stato ordine
}
```

Nello SDK puoi usare le **Sessions** per la memoria conversazionale, oppure identificativi di continuazione gestiti dal server.  
Non mescolare strategie senza capirne la semantica.

## Buone pratiche

- Limita retention e dimensioni dei messaggi.
- Non memorizzare password, chiavi API o dati personali non necessari.
- Se riassumi la cronologia, preserva i vincoli dell'utente e indica le incertezze.
- Non fidarti della memoria per pagamenti, stock e disponibilità: interroga i sistemi reali.

Documentazione: [Sessions](https://openai.github.io/openai-agents-python/sessions/).
