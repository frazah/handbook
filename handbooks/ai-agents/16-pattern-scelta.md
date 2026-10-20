<!-- level: Qualità -->
<!-- summary: Decision tree per API diretta, tool calling, RAG, SDK e multi-agent -->
# Progettare il livello giusto di automazione
## Prima del codice: cosa riconoscere

Scegli il pattern meno complesso che risolve il problema: funzione → workflow → RAG → agenti con tool → più agenti. Misura il beneficio prima di aumentare l’autonomia.


| Problema | Partenza consigliata |
|---|---|
| Riassunto di un testo già noto | Chiamata LLM senza agenti |
| Ricerca in FAQ con fonti | Retrieval + risposta grounded (RAG) |
| Recuperare uno stato ordine | Endpoint deterministico; eventualmente LLM per interpretazione |
| Richiesta ambigua con più letture | Un agente con tool di sola lettura |
| Processi con regole chiare e molti step | Workflow deterministico |
| Richieste con domini molto diversi | Router o specialisti, poi eventualmente multi-agent |
| Pagamenti, invii, cancellazioni | Proposta + approvazione + controllo backend |

## Checklist prima del codice

1. Qual è il compito, e qual è il criterio di successo?
2. Quali informazioni sono affidabili e dove si trovano?
3. Quali tool servono realmente?
4. Quanto può costare una run? Quanto può durare?
5. Come blocco tool non autorizzati o output falsi?
6. Come valuterò almeno 20 esempi realistici?
7. Qual è il percorso di fallback?

L'obiettivo non è «massima autonomia», ma **automazione utile, misurabile e controllabile**.
