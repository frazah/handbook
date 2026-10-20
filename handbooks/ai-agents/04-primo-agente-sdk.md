<!-- level: Fondamenti -->
<!-- summary: Primo agente Python con Agents SDK, tool reale e chiave API -->
# Primo agente con OpenAI Agents SDK (Python)

Lo SDK fornisce `Agent` e `Runner` e gestisce il ciclo delle chiamate ai tool.  
Questo esempio **usa un'API esterna**, perciò richiede una chiave e potrebbe avere costi.

**Prima di leggere il codice — simboli e termini:**

- ***Tool calling***: il modello propone un’azione, ma il codice dell’app la valida e la esegue.

```bash
python -m venv .venv
# Attiva il venv
python -m pip install openai-agents
# Configura OPENAI_API_KEY tramite variabile d'ambiente;
# non scrivere la chiave nel codice né committarla.
```

```python
from agents import Agent, Runner
from agents.decorators import tool

@tool
def lookup_order(order_id: str) -> str:
    """Return the current status of a demo order ID."""
    statuses = {"O-102": "spedito", "O-103": "in preparazione"}
    # get legge una chiave e può usare un default se manca.
    return statuses.get(order_id, "ordine non trovato")

agent = Agent(
    name="Order support",
    instructions="Rispondi solo sullo stato degli ordini. Usa lookup_order e non inventare dati.",
    tools=[lookup_order],
)

result = Runner.run_sync(agent, "Controlla lo stato di O-102")
print(result.final_output)
```

`Runner.run_sync` va bene per un programma sincrono.  
In un server `async`, usa `await Runner.run(...)` anziché bloccare il loop.  
I tool sono Python reali: aggiungi validazione, permessi e timeout prima di connetterli a sistemi di produzione.

**Versioni:** verifica sempre la guida [Agents SDK](https://openai.github.io/openai-agents-python/quickstart/), perché le API dei framework evolvono.
