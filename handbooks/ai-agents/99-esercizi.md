<!-- level: Esercizi -->
<!-- summary: Agente offline, tool registry, escalation e test di sicurezza -->
# Esercizi AI Agents

1. Apri `esempi/ai-agents/` e studia il catalogo ordini fittizio.
2. Aggiungi `get_shipping_policy()` come tool di sola lettura.
3. Definisci un set di comandi che **non** deve mai chiamare tool non autorizzati.
4. Crea un caso di prompt injection all'interno della descrizione di un ordine e verifica che sia trattato come dato.
5. Aggiungi una proposta di reso senza esecuzione effettiva.
6. Aggiungi test per ID ordine inesistente, argomenti invalidi e tool non ammessi.
7. *Optional online:* avvia l'esempio `sdk_order_agent.py` con credenziali in variabile d'ambiente; osserva le chiamate ai tool e annota costi e limiti.

**Regola laboratorio:** l'esempio offline non usa alcuna chiave né chiama modelli.  
È un runtime deterministico per capire tool, validazione, autorizzazioni e test.  
L'esempio online è separato e facoltativo.
