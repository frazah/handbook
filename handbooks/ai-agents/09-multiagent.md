<!-- level: Orchestrazione -->
<!-- summary: Routing, handoffs, manager pattern e quando evitare multi-agent -->
# Multi-agent: un orchestratore e specialisti

Un sistema multi-agent separa ruoli: uno classifica la richiesta, un altro cerca ordini, un altro interpreta la policy.  
Non significa che serva una squadra di agenti per ogni problema.

## Due pattern

- **Handoff:** il controllo passa allo specialista, che porta avanti il turno.
- **Manager / agents-as-tools:** un agente principale invoca gli specialisti come tool e compone la risposta.

```python
from agents import Agent, Runner

orders = Agent(name="Orders", handoff_description="Stato ordini",
               instructions="Aiuta con lo stato degli ordini demo.")
policy = Agent(name="Policy", handoff_description="Politiche reso",
               instructions="Spiega le policy fornite, senza inventare dettagli.")
triage = Agent(name="Triage", instructions="Instrada allo specialista adatto.",
               handoffs=[orders, policy])

# Richiede chiave API e openai-agents installato:
# result = Runner.run_sync(triage, "Voglio sapere i tempi del reso")
```

## Quando NON farlo

Se una semplice funzione `if/else`, un router deterministico o un solo tool coprono il caso, preferisci la soluzione più testabile ed economica.  
Multi-agent introduce più chiamate, latenza e superfici d'errore.

Approfondimento: [orchestration](https://openai.github.io/openai-agents-python/multi_agent/).
