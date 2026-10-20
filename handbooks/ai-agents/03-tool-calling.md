<!-- level: Fondamenti -->
<!-- summary: Schema, validazione, allowlist e ciclo di chiamata degli strumenti -->
# Tool calling: il modello sceglie, il codice esegue

Un tool è una funzione dell'applicazione esposta all'agente con nome, descrizione e argomenti tipizzati.  
Il modello **non esegue Python direttamente**: produce una richiesta che il runtime deve verificare.

**Prima di leggere il codice — simboli e termini:**

- ***Tool calling***: il modello propone un’azione, ma il codice dell’app la valida e la esegue.

```python
ORDERS = {"O-102": "spedito", "O-103": "in preparazione"}

def lookup_order(order_id: str) -> dict:
    if order_id not in ORDERS:
        return {"found": False}
    return {"found": True, "order_id": order_id, "status": ORDERS[order_id]}

ALLOWED_TOOLS = {"lookup_order": lookup_order}

# In un runtime: la chiamata arriva come dati strutturati.
def execute_tool(name: str, args: dict) -> dict:
    if name != "lookup_order" or set(args) != {"order_id"}:
        raise ValueError("Tool o argomenti non ammessi")
    order_id = args["order_id"]
    if not isinstance(order_id, str) or len(order_id) > 40:
        raise ValueError("ID non valido")
    return ALLOWED_TOOLS[name](order_id)

print(execute_tool("lookup_order", {"order_id": "O-102"}))
```

Nel mondo reale verifica anche **identità e diritto di accesso** all'ordine: l'esempio insegna la validazione ma non è un sistema di autorizzazione.

**Separazione fondamentale:** tool di lettura a basso rischio possono essere automatici; invio email, acquisti, cancellazioni, shell o trasferimenti richiedono controlli più severi e spesso approvazione esplicita.
