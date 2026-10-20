<!-- level: Reference -->
<!-- summary: Concetti essenziali, ciclo agente e criteri decisionali -->
# AI Agents — Cheatsheet

## Glossario

| Termine | In breve |
|---|---|
| **LLM** | Modello che genera testo/risposte; non è automaticamente un agente |
| **Agent** | Modello + istruzioni + strumenti + loop controllato |
| **Tool calling** | Il modello propone una chiamata strutturata; il runtime la esegue |
| **RAG** | Recupero di documenti rilevanti prima della generazione |
| **Embedding** | Rappresentazione vettoriale utile per similarità semantica |
| **Memory/session** | Stato conversazionale persistito con limiti appropriati |
| **Guardrail** | Controlli su input, output, operazioni e autorizzazioni |
| **Handoff** | Trasferimento del controllo a uno specialista |
| **MCP** | Protocollo standard per collegare strumenti e risorse |
| **Eval** | Test ripetibili di qualità, sicurezza, latenza e costi |

## Ciclo concettuale

```text
Richiesta → policy/contesto → modello → [risposta | richiesta tool]
                                       ↓
                              verifica autorizzazione
                                       ↓
                              esecuzione tool → risultato
                                       └────→ modello → risposta
```

**Parti da un workflow semplice** quando puoi descrivere i passi in modo deterministico.  
Aggiungi un agente solo se la scelta dinamica dei passi aggiunge valore.

## Quale approccio scegliere?

- Una chiamata di generazione → API LLM diretta.
- Un modello che usa 1–3 strumenti → tool calling con limiti.
- Gestione di turni e tool con orchestrazione → Agents SDK.
- Risposte sui tuoi documenti → RAG + citazioni.
- Azioni pericolose → approvazione umana + autorizzazione server-side.

I componenti LLM online richiedono una chiave API e possono avere costi; il laboratorio offline non ne richiede.

---

## Pattern agentici: pseudocodice e check di sicurezza

```text
# Pseudocodice portabile: qui il modello NON esegue tool da solo.
for step in range(max_steps):
    decision = model_decide(messages, available_tools)
    if decision.kind == 'answer':
        return decision.text

    # Verifica schema, autorizzazione e limiti PRIMA dell'esecuzione.
    args = validate_tool_arguments(decision.tool, decision.arguments)
    authorize(user, decision.tool, args)
    result = execute_allowed_tool(decision.tool, args)
    messages.append(tool_result_message(result))
```

**Nota:** i nomi `model_decide`, `authorize` ed `execute_allowed_tool` sono **segnaposto concettuali**, non funzioni di una libreria pronta.  
L'implementazione completa è nei capitoli/laboratori.

| Situazione | Schema utile |
|---|---|
| Un'unica risposta | Chiamata LLM senza loop |
| Decisione dinamica su tool | Tool calling limitato da allowlist |
| Passi fissi | Workflow deterministico, senza agente |
| Fonti documentali | Retrieval → verifica → risposta con fonti |
| Memoria | Stato minimo per sessione, con scadenza/permessi |
| Più specialisti | Orchestrazione con handoff esplicito |
| Interventi irreversibili | Human approval + autorizzazione server-side |
| Affidabilità | Dataset eval con casi positivi, negativi e attacchi |
| Spesa | Token budget, timeout, retry bounded, limite iterazioni |

## Output strutturati e RAG

```python
# Contratto concettuale per un output JSON: valida prima di usarlo.
example = {'order_id': 'O-102', 'action': 'read_status', 'approved': False}

# Pipeline RAG (pseudocodice): domanda → fonti → prompt → risposta.
# chunks = retrieve_relevant_docs(question, allowed_sources)
# answer = generate_answer(question, chunks)
# assert citations_refer_to(chunks, answer)
```

**Checklist di produzione:** identità, autorizzazione per risorsa, validazione input/output, niente segreti nei prompt, fonti e versioni, logging con dati minimizzati, eval regressivi, gestione prompt injection e strumenti a rischio dietro approvazione.
