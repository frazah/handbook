# AI Agents

> Applicazioni costruite su LLM: dalla singola chiamata al modello agli **agenti** che usano strumenti in un ciclo. Concetti, pattern e rischi che servono per progettarle e per parlarne a un colloquio.
> Collegate: [Python](../Languages/Python.md) · [SQL](../Languages/SQL.md) · [Data Science](Data%20Science.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md)

## Modello mentale

- Un **LLM** predice il **token** successivo (un frammento di parola) dato il testo precedente. Tutto ciò che "sa" in una richiesta sta nei pesi del modello o nel **contesto** che gli passi.
- Il **context window** è il massimo di token (input + output) per richiesta. Il modello non ha memoria tra le chiamate: la "conversazione" è la lista di messaggi che rimandi ogni volta.
- Le **allucinazioni** sono testo plausibile ma falso: il modello ottimizza la plausibilità, non la verità. Si mitigano con dati nel contesto (RAG), strumenti e verifiche.
- Un **tool** (function calling) è una funzione tua descritta con nome, descrizione e JSON Schema. Il modello non la esegue: **chiede** di chiamarla, e la tua applicazione la esegue e restituisce il risultato.
- Un **agente** è un LLM in un **ciclo**: decide un'azione, osserva il risultato, decide la prossima, fino a completare il compito o a una condizione di stop.
- **Parti dal livello più semplice:** chiamata singola → workflow deterministico (passi fissi decisi dal codice) → agente (passi decisi dal modello). Ogni livello aggiunge costo, latenza e imprevedibilità.
- Il testo che entra nel contesto (pagine web, email, risultati dei tool) può contenere istruzioni malevole: la **prompt injection** è il rischio di sicurezza principale.

## Sintassi al volo

| Termine | Significato |
|---|---|
| System prompt | istruzioni stabili: ruolo, regole, formato |
| Messaggi | lista di turni `user` / `assistant`; i risultati dei tool tornano come contenuto `user` |
| `stop_reason` | perché il modello si è fermato: `end_turn`, `tool_use`, `max_tokens`, `refusal`… |
| Structured output | risposta vincolata a uno schema JSON |
| Embedding | vettore numerico che rappresenta il significato di un testo |
| RAG | Retrieval-Augmented Generation: recupera documenti pertinenti e li inserisce nel contesto |
| Eval | insieme di casi di test con criteri di valutazione |
| Prompt caching | riuso del prefisso già elaborato del prompt: meno costo e latenza |

## Prompt engineering essenziale

- **Sii specifico:** compito, pubblico, formato dell'output, vincoli. Spiega il *perché* delle regole: il modello generalizza meglio.
- **Separa istruzioni e dati** con delimitatori chiari (es. tag `<order>…</order>`), così il modello non confonde il contenuto con gli ordini.
- **Esempi** (few-shot) per formati o stili difficili da descrivere.
- Chiedi di **ragionare prima di rispondere** nei compiti complessi, oppure usa i modelli con *thinking* integrato.
- Per output da elaborare con codice, usa gli **structured output** invece di sperare in un JSON corretto.
- Itera con un **set di casi di test**, non a sensazione.

## Il ciclo dell'agente

1. Invii messaggi + definizioni dei tool.
2. Se `stop_reason == "tool_use"`, la risposta contiene uno o più blocchi `tool_use` (nome + input).
3. Esegui i tool, **validando l'input** e applicando i permessi dell'utente.
4. Rimandi la risposta dell'assistente e un messaggio `user` con i blocchi `tool_result` (stesso `tool_use_id`).
5. Ripeti fino a `end_turn`, o fino a un **limite di iterazioni**, di costo o di tempo.

Esempio eseguibile senza API: un agente di supporto clienti con un modello "finto" a copione, ma con strumenti veri su SQLite. La struttura dei messaggi è la stessa dell'API reale.

```python
import json, sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INT, status TEXT)")
db.execute("INSERT INTO orders VALUES (101, 7, 'shipped'), (102, 8, 'pending')")

def get_order_status(order_id: int, *, customer_id: int) -> str:
    # customer_id viene dalla sessione autenticata, MAI dal modello: least privilege.
    row = db.execute("SELECT status FROM orders WHERE id = ? AND customer_id = ?",
                     (order_id, customer_id)).fetchone()
    return json.dumps({"order_id": order_id, "status": row[0] if row else "not_found"})

TOOLS = {"get_order_status": get_order_status}

def scripted_model(messages: list[dict]) -> dict:
    """Simula il modello: prima chiede un tool, poi risponde usando il risultato."""
    last = messages[-1]["content"]
    if isinstance(last, str):
        return {"stop_reason": "tool_use", "content": [
            {"type": "tool_use", "id": "t1", "name": "get_order_status", "input": {"order_id": 101}}]}
    status = json.loads(last[0]["content"])["status"]
    return {"stop_reason": "end_turn", "content": [{"type": "text", "text": f"Il tuo ordine è: {status}"}]}
```

```python
# continua dall'esempio precedente
def run_agent(question: str, customer_id: int, max_steps: int = 5) -> str:
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):  # limite: un agente non deve girare all'infinito
        response = scripted_model(messages)
        messages.append({"role": "assistant", "content": response["content"]})
        if response["stop_reason"] != "tool_use":
            return next(b["text"] for b in response["content"] if b["type"] == "text")
        results = []
        for block in response["content"]:
            if block["type"] != "tool_use":
                continue
            tool = TOOLS.get(block["name"])
            output = tool(**block["input"], customer_id=customer_id) if tool else "unknown tool"
            results.append({"type": "tool_result", "tool_use_id": block["id"], "content": output})
        messages.append({"role": "user", "content": results})  # tutti i risultati in UN messaggio
    return "Non sono riuscito a completare la richiesta."

assert run_agent("Dov'è il mio ordine 101?", customer_id=7) == "Il tuo ordine è: shipped"
assert run_agent("Dov'è il mio ordine 101?", customer_id=8) == "Il tuo ordine è: not_found"
```

### Con l'API reale

```python
# illustrativo: richiede `pip install anthropic` e una API key (ANTHROPIC_API_KEY)
import anthropic

client = anthropic.Anthropic()
tools = [{
    "name": "get_order_status",
    "description": "Restituisce lo stato di un ordine del cliente autenticato.",
    "input_schema": {"type": "object", "properties": {"order_id": {"type": "integer"}},
                     "required": ["order_id"]},
}]
messages = [{"role": "user", "content": "Dov'è il mio ordine 101?"}]

response = client.messages.create(model="claude-opus-5-5", max_tokens=16000,
                                  tools=tools, messages=messages)
# Da qui il ciclo è identico a run_agent: se stop_reason == "tool_use", esegui i blocchi
# tool_use, rimanda response.content come assistant e i tool_result come user.
# Controlla sempre stop_reason prima di leggere il contenuto (es. "refusal", "max_tokens").
```

In produzione l'SDK offre un **Tool Runner** (`client.beta.messages.tool_runner`) che gestisce il ciclo al posto tuo; il loop manuale serve quando vuoi il controllo completo.

## Structured output

Quando l'output deve essere elaborato dal codice (classificazione di un ticket, estrazione di campi da un'email), vincolalo a uno schema e **validalo** comunque prima dell'uso: `stop_reason == "max_tokens"` può troncarlo, e i valori possono essere sintatticamente validi ma sbagliati.

## RAG (Retrieval-Augmented Generation)

Il modello non conosce i tuoi documenti (policy di reso, FAQ, schede prodotto). Il RAG li recupera al momento della domanda e li inserisce nel contesto.

1. **Chunking:** dividi i documenti in pezzi (es. 300–800 token, con sovrapposizione), conservando titolo e sorgente.
2. **Indicizzazione:** calcola un embedding per ogni chunk e salvalo in un vector store (pgvector, FAISS, un servizio gestito).
3. **Retrieval:** calcola l'embedding della domanda e prendi i *k* chunk più simili (similarità coseno). La **ricerca ibrida** (vettori + keyword BM25) trova anche codici e nomi esatti.
4. **Reranking** (opzionale): un modello più preciso riordina i candidati.
5. **Generazione:** il prompt contiene i chunk con le loro fonti, e l'istruzione di rispondere *solo* in base a quelli e di citarli.

Retrieval minimo con similarità coseno su conteggi di parole (al posto degli embedding):

```python
import math
from collections import Counter

docs = {
    "resi": "Puoi restituire un prodotto entro 30 giorni dalla consegna",
    "spedizioni": "La spedizione standard arriva in 3-5 giorni lavorativi",
    "pagamenti": "Accettiamo carta di credito e bonifico bancario",
}

def vectorize(text: str) -> Counter:
    return Counter(text.lower().split())

def cosine(a: Counter, b: Counter) -> float:
    dot = sum(a[w] * b[w] for w in a)
    norm = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return dot / norm if norm else 0.0

def retrieve(question: str, k: int = 1) -> list[str]:
    q = vectorize(question)
    return sorted(docs, key=lambda d: cosine(q, vectorize(docs[d])), reverse=True)[:k]

assert retrieve("entro quanti giorni posso restituire un prodotto?") == ["resi"]
```

Gli embedding veri catturano il **significato** ("rimborso" ≈ "reso"), che i conteggi di parole non vedono. Per valutare il RAG misura separatamente il **retrieval** (il chunk giusto è nei primi *k*?) e la **generazione** (la risposta è fedele alle fonti?).

## Contesto e memoria

- Il contesto è una risorsa limitata: più è lungo, più costa e più il modello rischia di perdere dettagli.
- **Conversazioni lunghe:** riassumi (compattazione) o rimuovi i vecchi risultati dei tool.
- **Memoria a lungo termine:** salva fatti e preferenze in un archivio e recuperali come nel RAG.
- **Prompt caching:** metti il contenuto stabile (system prompt, tool, documenti) all'inizio e quello variabile alla fine, così il prefisso viene riusato.

## Multi-agente

Un orchestratore che delega sotto-compiti ad altri agenti (ricerca in parallelo, revisore separato dall'autore). È utile quando il lavoro si divide in parti indipendenti o quando un contesto non basta. Ha un costo: più token, più latenza, errori che si propagano tra agenti. Per la maggior parte dei casi un singolo agente con buoni tool, o un workflow deterministico, è più affidabile.

## Valutazione

- Un **golden set** di casi reali con il risultato atteso, eseguito a ogni modifica del prompt o del modello (test di regressione).
- **Controlli deterministici** quando possibile (JSON valido, tool giusto chiamato, numero corretto); **LLM-as-judge** con una rubrica per qualità e tono, verificato a campione da un umano.
- Per gli agenti misura anche il **percorso**: numero di passi, tool chiamati, costo e latenza per compito completato.

## Sicurezza

| Rischio | Mitigazione |
|---|---|
| **Prompt injection** (istruzioni nascoste in email, pagine, documenti) | trattare i contenuti esterni come dati, separarli con delimitatori, permessi minimi ai tool |
| Tool con troppi poteri | **least privilege**: identità e permessi presi dalla sessione, non dall'input del modello; tool di sola lettura dove possibile |
| Azioni irreversibili (rimborsi, email, delete) | **human-in-the-loop**: conferma esplicita prima dell'esecuzione |
| Dati personali | minimizzare ciò che entra nel contesto, mascherare le PII, rispettare la retention |
| Output usato come codice o SQL | mai eseguirlo senza validazione; query parametrizzate |
| Costi fuori controllo | limiti di iterazioni, token e spesa per richiesta e per utente |

## Costi e latenza

- Il costo dipende dai token di **input** e di **output** (l'output costa di più). I lunghi contesti ripetuti a ogni turno sono la voce principale negli agenti.
- Leve: prompt caching, modelli più piccoli per i sotto-compiti semplici, meno sforzo di ragionamento dove la qualità regge, batch API per il lavoro non urgente, risposte più concise.
- Latenza percepita: **streaming** della risposta, tool eseguiti in parallelo.

## Domande da colloquio

**Base**
- **Cos'è un token e perché conta?** L'unità di testo che il modello elabora (spesso parte di una parola). Costo, limiti di contesto e latenza si misurano in token.
- **Cos'è un'allucinazione e come la riduci?** Un'affermazione plausibile ma falsa. Si riduce fornendo i dati nel contesto (RAG, tool), chiedendo di citare le fonti e di dire "non lo so", e verificando l'output.
- **Il modello esegue i tool?** No: restituisce una richiesta di chiamata con gli argomenti; è l'applicazione a eseguirla, applicare i permessi e restituire il risultato.

**Intermedio**
- **Come funziona un agente?** Un ciclo in cui il modello sceglie un'azione (tool), l'app la esegue e restituisce l'osservazione, finché il compito è completo o si raggiunge un limite.
- **RAG o fine-tuning?** Il RAG per dare conoscenza aggiornata e citabile (documenti che cambiano); il fine-tuning per cambiare stile, formato o comportamento su compiti ripetitivi. Spesso basta il RAG con buoni prompt.
- **Come valuti un sistema RAG?** Separando retrieval (recall@k, il documento giusto è tra i risultati?) e generazione (fedeltà alle fonti, pertinenza), con un set di domande annotate.
- **Workflow o agente?** Workflow quando i passi sono noti a priori: è più prevedibile, economico e testabile. Agente quando il percorso dipende da ciò che si scopre strada facendo.
- **Perché gli structured output?** Garantiscono un formato elaborabile dal codice invece di fare il parsing di testo libero; vanno comunque validati semanticamente.
- **Come funziona un transformer, in breve?** Trasforma i token in vettori e, strato dopo strato, li aggiorna con la **self-attention**: ogni token pesa quanto sono rilevanti gli altri. Il costo cresce con il quadrato della lunghezza del contesto.
- **Cosa sono gli embedding e un vector database?** Gli embedding sono vettori in cui testi simili per significato sono vicini; un vector database li indicizza per trovare rapidamente i più simili (approximate nearest neighbor).

**Avanzato**
- **Cos'è la prompt injection e come ti difendi?** Istruzioni malevole inserite in contenuti che il modello legge. Non esiste una difesa perfetta: si limitano i danni con permessi minimi, separazione tra dati e istruzioni, conferma umana per le azioni sensibili e monitoraggio.
- **Come gestisci un contesto che cresce troppo?** Compattazione (riassunto), rimozione dei vecchi risultati dei tool, memoria esterna recuperata su richiesta e sotto-agenti che restituiscono solo una sintesi.
- **Come riduci costo e latenza?** Prompt caching su un prefisso stabile, modelli più piccoli per i passi semplici, parallelismo dei tool, streaming, batch per il lavoro offline. Si misura il costo per compito completato, non per richiesta.
- **Quando usare più agenti?** Quando il lavoro si divide in parti indipendenti parallelizzabili o supera un solo contesto. Altrimenti aggiungono costo e punti di fallimento.
- **Il RAG allucina anche se la risposta è nei documenti: come lo diagnostichi?** Prima controlli il retrieval (il chunk giusto arriva nel contesto? chunking, embedding, k, reranking), poi la generazione (il prompt impone di usare solo le fonti? il contesto è troppo lungo o rumoroso?). Le eval separate per i due stadi dicono dove intervenire.

## Approfondisci

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Claude API — Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) · [Prompt engineering](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/)
