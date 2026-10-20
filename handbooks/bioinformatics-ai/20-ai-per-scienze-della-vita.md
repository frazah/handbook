<!-- level: AI + Biologia -->
<!-- summary: LLM, RAG, agenti, immagini e human-in-the-loop nella ricerca -->
# LLM e agenti AI per la ricerca biologica

I language model possono aiutare a **cercare letteratura**, estrarre informazioni, costruire interrogazioni di database pubblici, generare report e assistere in revisione di codice.  
Un *agente* può orchestrare più strumenti: non è per questo più affidabile di un singolo modello.

## Esempio di assistente responsabile

Richiesta: «Riassumi studi pubblici sull'impatto di uso del suolo e biodiversità».

```text
utente → ricerca su fonti pubbliche → recupero articoli
       → controllo date / disegno degli studi
       → sintesi con citazioni verificabili
       → revisione umana
```

**RAG** = recuperare documenti rilevanti e fornirli come contesto al modello.  
Riduce alcuni errori di memoria, ma può comunque generare riferimenti imprecisi o interpretazioni sbagliate.

**Pericoli principali:** citazioni inventate, confondere correlazioni con causalità, ingestione di dati personali non autorizzati, prompt injection in documenti esterni, automatizzare azioni irreversibili.

## Regole d'uso

- Usa **solo** dati ai quali hai diritto di accesso.
- Registra provenienza e versioni dei documenti.
- Se il modello propone una conclusione biologica, chiedi *quale evidenza la supporta*.
- Mantieni revisione umana sulle conclusioni scientifiche e sulle decisioni sanitarie.
- Non progettare workflow che facilitino applicazioni biologiche pericolose.

Per tool calling, RAG e valutazioni di agenti, continua nell'handbook *AI Agents* già presente nell'Hub.
