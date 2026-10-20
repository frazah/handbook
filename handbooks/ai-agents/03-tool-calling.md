<!-- level: Fondamenti -->
<!-- summary: Tool calling spiegato per passi, schema, permessi e runtime di esecuzione -->
# Tool calling: il modello chiede, il codice decide

**Obiettivo:** capire la differenza fra una proposta del modello e una funzione eseguita dal tuo programma.

## 1. Prima il tool: una normale funzione

```python
ORDERS = {
    "O-102": "spedito",
    "O-103": "in preparazione",
}

def lookup_order(order_id: str) -> dict:
    # Proteggi l'accesso a una chiave che potrebbe non esistere.
    if order_id not in ORDERS:
        return {"found": False}

    return {
        "found": True,
        "order_id": order_id,
        "status": ORDERS[order_id],
    }
```

Questa è **solo Python**: il modello non è coinvolto.
`order_id: str` annota un parametro, `-> dict` il tipo di risultato atteso.

## 2. Il modello propone una chiamata in forma di dati

```json
{
  "tool": "lookup_order",
  "arguments": {"order_id": "O-102"}
}
```

Questo JSON è un **esempio di messaggio**, non una chiamata eseguita.
L'applicazione deve scegliere che cosa fare con la richiesta.

## 3. Un runtime minimo: allowlist e validazione

```python
# Solo queste funzioni possono essere richiamate con il dispatcher.
ALLOWED_TOOLS = {
    "lookup_order": lookup_order,
}

def execute_tool(name: str, args: dict) -> dict:
    # 1. Non accettare nomi di tool sconosciuti.
    if name not in ALLOWED_TOOLS:
        raise ValueError("Tool non consentito")

    # 2. Per questo tool accettiamo esattamente il campo order_id.
    if set(args) != {"order_id"}:
        raise ValueError("Argomenti non previsti")

    order_id = args["order_id"]

    # 3. Verifica anche tipo e lunghezza del valore ricevuto.
    if not isinstance(order_id, str) or len(order_id) > 40:
        raise ValueError("ID ordine non valido")

    # 4. Solo ora il codice Python esegue la funzione consentita.
    return ALLOWED_TOOLS[name](order_id)

# Chiamata di prova SENZA un LLM reale.
print(execute_tool("lookup_order", {"order_id": "O-102"}))
```

**Attenzione — autorizzazioni:** lo schema e l'allowlist non verificano che la persona abbia diritto a leggere l'ordine.
Una API reale deve controllare identità, proprietà della risorsa, scadenze e permessi anche per i tool di sola lettura.

## 4. E il ciclo agente?

1. Il modello riceve richiesta e strumenti consentiti.
2. Propone una risposta finale oppure una chiamata a uno strumento.
3. Il runtime controlla argomenti, permessi, limiti, poi esegue.
4. Il risultato torna al modello, che prepara la risposta successiva.

Per tool con effetti reali (email, acquisti, modifica o eliminazione) aggiungi approvazione umana, audit e protezioni contro chiamate duplicate.
