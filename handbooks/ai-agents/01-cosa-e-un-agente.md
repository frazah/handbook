<!-- level: Fondamenti -->
<!-- summary: LLM, workflow deterministico, agente autonomo e casi d'uso -->
# Cos'è un agente (e quando non serve)

Un **LLM** risponde a un input.  
Un **workflow** segue passaggi codificati.  
Un **agente** decide quali strumenti invocare per raggiungere un obiettivo, all'interno dei vincoli definiti dall'applicazione.

## Esempio: supporto ordini

- Richiesta: «Dov'è l'ordine O-102?». Un workflow può chiamare direttamente il database, senza AI.
- Richiesta: «Il mio ordine non arriva: controlla stato, spedizione e policy, poi spiegami cosa posso fare». Un agente può scegliere fra più tool di sola lettura.
- Richiesta: «Rimborsami»: il modello **non deve poter rimborsare** senza autorizzazione applicativa e approvazione prevista.

## Loop con limite

**Prima di leggere il codice — simboli e termini:**

- ***Tool calling***: il modello propone un’azione, ma il codice dell’app la valida e la esegue.

```python
MAX_STEPS = 5
for step in range(MAX_STEPS):
    decision = decide_next_action(context)  # pseudocodice: chiamata LLM
    if decision.kind == "final":
        return decision.answer
    # get legge una chiave e può usare un default se manca.
    tool = allowed_tools.get(decision.tool_name)
    if tool is None:
        raise ValueError("Tool non autorizzato")
    result = tool(**validate_arguments(decision.args))
    context.append(result)
raise RuntimeError("Limite di passi raggiunto")
```

Questo frammento mostra l'**architettura**, non è eseguibile senza implementare i metodi indicati.  
Il framework gestisce molti di questi passaggi, ma **sicurezza e autorizzazioni restano responsabilità della tua applicazione**.
