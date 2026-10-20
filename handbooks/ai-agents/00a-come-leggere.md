<!-- level: Fondamenti -->
<!-- summary: Come leggere esempi di agenti: modello, tool, JSON, orchestrazione e autorizzazioni -->
# Prima degli agenti AI: componenti e sintassi

Un **LLM** genera una risposta; un **agente** può scegliere passi e richiedere strumenti tramite un'applicazione che ne controlla l'esecuzione.
Un modello che scrive `delete_order(...)` non ha cancellato nulla finché il **tuo codice** non decide di eseguire l'azione.

## Dal modello al tool: i quattro passaggi

```text
1. Utente: "A che punto è l'ordine O-102?"
2. Modello: richiede lookup_order con argomento order_id="O-102"
3. Applicazione: valida argomenti + autorizzazione, poi chiama il tool
4. Modello: legge il risultato e scrive la risposta
```

## Tool = normale funzione Python, più un contratto

```python
ORDERS = {"O-102": "spedito"}

# Il tipo str dice cosa ci si aspetta dall'argomento.
# Tool di lettura: lo stato letto non dimostra l’identità del richiedente.
def lookup_order(order_id: str) -> dict:
    # Non tutti gli ID sono presenti: controlla prima.
    if order_id not in ORDERS:
        return {"found": False}

    return {
        "found": True,
        "status": ORDERS[order_id],
    }

print(lookup_order("O-102"))
```

`dict` è un tipo Python; in un sistema reale specifica anche lo **schema degli argomenti** del tool e valida i dati ricevuti dal modello.

## Contratto JSON e differenza con l'autorizzazione

```json
{
  "tool": "lookup_order",
  "arguments": {"order_id": "O-102"}
}
```

Questo è solo **un messaggio di richiesta**, non un comando eseguito.
Controlli server-side separati devono verificare identità, permessi, limiti di chiamata e validità dell'ID.

## Memoria, RAG e valutazione

- **Memoria**: stato conservato tra turni, con confini di autorizzazione e retention.
- **RAG**: recuperare documenti prima di generare una risposta; una fonte recuperata non diventa istruzione affidabile.
- **Eval**: test ripetibili su casi noti, attacchi, errori e costi.

**Nota:** i nomi delle API dei diversi SDK possono cambiare; segui il capitolo specifico e la documentazione della versione installata.
