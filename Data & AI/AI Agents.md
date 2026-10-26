# AI Agents — Cheatsheet

> **Quando serve:** creare applicazioni LLM che usano strumenti, dati aziendali o workflow multi-step. Evita un agente quando basta una chiamata deterministica o una semplice query.

Un agente non è solo un prompt: combina **modello, istruzioni, stato, strumenti e un ciclo di controllo**. Il modello può *richiedere* un tool; l'applicazione decide se e come eseguirlo, con permessi e validazione.

## Sintassi e termini essenziali

| Termine | Significato pratico |
|---|---|
| **System instructions** | regole e obiettivi dell'applicazione |
| **Tool/function calling** | richiesta strutturata per invocare una funzione |
| **Structured output** | risposta con schema verificabile |
| **RAG** | recupero documenti rilevanti prima della generazione |
| **Embeddings** | vettori utili per la ricerca semantica |
| **Memory/state** | contesto da conservare esplicitamente |
| **Human-in-the-loop** | approvazione umana prima di azioni sensibili |
| **Guardrails** | controlli su input, output, tool, permessi |
| **Eval/trace** | test ripetibili + registrazione dei passaggi |
| **MCP** | protocollo di collegamento a tool e risorse |

## Concetti applicati

### Il ciclo minimo

```text
Messaggio utente
   ↓
App: policy + contesto + strumenti disponibili
   ↓
LLM → risposta finale O richiesta di tool
                           ↓
                Validazione + autorizzazione
                           ↓
                Esecuzione tool nell'app
                           ↓
                Risultato tool → LLM
                           ↓
                       Risposta
```

**Punto chiave:** non eseguire qualunque cosa venga chiesta dal modello. L'app controlla parametri, identità dell'utente, permessi, timeout, costi e numero massimo di passaggi.

### Esempio senza API a pagamento: tool dispatch

```python
from dataclasses import dataclass
import sqlite3

@dataclass(frozen=True)
class UserContext:
    user_id: str  # Deriva dalla sessione verificata, NON dal modello.

# Adapter semplificato per un repository SQL reale.
def get_order_status(order_id: int, context: UserContext, db: sqlite3.Connection) -> dict:
    # Il WHERE applica il controllo di proprietà già nella query.
    row = db.execute(
        'SELECT id, status FROM orders WHERE id = ? AND owner_id = ?',
        (order_id, context.user_id),
    ).fetchone()
    if row is None:
        raise PermissionError('Order not found or access denied')
    return {'order_id': row[0], 'status': row[1]}

# Simulazione LOCALE: il modello non è davvero collegato.
request = {'name': 'get_order_status', 'arguments': {'order_id': 101}}
context = UserContext(user_id='u1')

# Questo setup SQLite rappresenta dati di test, non un account reale.
with sqlite3.connect(':memory:') as db:
    db.execute('CREATE TABLE orders (id INTEGER, owner_id TEXT, status TEXT)')
    db.execute("INSERT INTO orders VALUES (101, 'u1', 'shipped')")

    if request['name'] != 'get_order_status':
        raise ValueError('Tool non consentito')

    order_id = request['arguments'].get('order_id')
    # bool è una sottoclasse di int in Python: qui richiediamo proprio int.
    if type(order_id) is not int or order_id <= 0:
        raise ValueError('order_id non valido')

    print(get_order_status(order_id, context, db))
```

Il dispatcher qui è **simulato**: il formato concreto di tool request dipende dall'SDK/provider. Non confondere l'esempio con una chiamata reale al modello.

### RAG in cinque passaggi

1. Ingestione: carichi documenti e metadati affidabili.
2. Chunking/indexing: organizzi testi per la ricerca (anche embedding).
3. Retrieval: recuperi le parti pertinenti alla domanda.
4. Grounding: fornisci le evidenze al modello con origine identificabile.
5. Evaluation: misuri copertura, pertinenza, accuratezza e citazioni.

**Attenzione:** i documenti recuperati sono **dati non fidati**, non nuove istruzioni di sistema. Il RAG può ridurre errori ma non garantisce risposte corrette.

---

- **Workflow deterministico:** passi noti, regole chiare → normale codice + LLM solo dove serve.
- **Single agent + tools:** domande variabili, diversi strumenti → modello che sceglie tool entro limiti.
- **Multi-agent:** specialisti con compiti distinti, quando semplifica veramente la separazione di responsabilità; aumenta complessità e costi.
- **Approvals:** conferma umana per invio messaggi, modifiche a dati, pagamenti e azioni irreversibili.
- **Evals:** dataset di domande/risposte attese, metriche per task, errori di autorizzazione e chiamate tool scorrette; versiona prompt e risultati.

Checklist produzione: logging senza segreti, budget di token e tool, rate limit, timeout, retry prudente, idempotenza delle azioni, audit, gestione PII, test contro prompt injection.

### Structured output, tool loop e valutazione

Uno *structured output* chiede al modello dati conformi a uno schema, ma l'app deve comunque controllare **permessi e invarianti di business** prima di qualsiasi azione. Il ciclo tool di produzione ha sempre: richiesta modello → parse JSON → allowlist del tool → validazione input → controllo autorizzazioni → timeout/esecuzione → risposta tool al modello. **Il testo recuperato da RAG non può autorizzare tool.**

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ToolCall:
    name: str
    arguments: dict


def dispatch(call: ToolCall, authorized_user_id: str, db):
    # Non accettare il nome utente generato dal modello come identità.
    if call.name != 'get_order_status':
        raise ValueError('Unknown tool')

    order_id = call.arguments.get('order_id')
    if type(order_id) is not int or order_id <= 0:
        raise ValueError('Invalid order ID')

    context = UserContext(user_id=authorized_user_id)
    return get_order_status(order_id, context, db)
```

Questo riutilizza `UserContext` e `get_order_status` dell'esempio sopra. **È la parte applicativa verificabile del ciclo**, non una chiamata SDK: formato preciso e stati del provider cambiano, quindi usa la documentazione dell'SDK scelto per collegare `function_call` e risultati.

**Collegare davvero un modello:** questo frammento mostra il ciclo con la Responses API. È un esempio di **integrazione**: richiede `pip install openai`, `OPENAI_API_KEY`, `OPENAI_MODEL` e un `db` + `trusted_user_id` ricavati dall'applicazione, non dal modello. È volutamente separato dalla simulazione locale.

```python
import json
import os
from openai import OpenAI

client = OpenAI()  # Legge la chiave dall'ambiente.
model_name = os.environ['OPENAI_MODEL']

tools = [{
    'type': 'function',
    'name': 'get_order_status',
    'description': 'Read an order status visible to the signed-in user',
    'parameters': {
        'type': 'object',
        'properties': {'order_id': {'type': 'integer'}},
        'required': ['order_id'],
        'additionalProperties': False,
    },
    'strict': True,
}]

messages = [{'role': 'user', 'content': 'Qual è lo stato dell’ordine 101?'}]

# Nel servizio reale `db` e `trusted_user_id` provengono dalla richiesta autenticata.
for _ in range(3):  # Limite ai turni di tool: evita loop infiniti.
    response = client.responses.create(
        model=model_name, input=messages, tools=tools,
    )
    messages.extend(response.output)  # Mantieni anche gli item del modello.
    calls = [item for item in response.output if item.type == 'function_call']
    if not calls:
        print(response.output_text)
        break

    for call in calls:
        arguments = json.loads(call.arguments)
        try:
            result = dispatch(ToolCall(call.name, arguments), trusted_user_id, db)
        except (ValueError, PermissionError):
            result = {'error': 'Order unavailable'}  # Non esporre dati protetti.

        messages.append({
            'type': 'function_call_output',
            'call_id': call.call_id,
            'output': json.dumps(result),
        })
else:
    raise RuntimeError('Tool iteration limit reached')
```

Il modello **chiede**, ma il backend *autorizza ed esegue*. In produzione gestisci anche errori SDK/rete, limiti di tempo, tracciamento e consumo token. I nomi dei campi e lo schema sono allineati alla [guida ufficiale al function calling](https://developers.openai.com/api/docs/guides/function-calling), ma non ho eseguito una chiamata remota a pagamento in questa revisione.

Per RAG pratico: indicizza soltanto testi con origine e permessi noti; recupera documenti rispettando i diritti dell'utente, conserva ID/versione del documento nelle citazioni, misura *retrieval recall* e accuratezza delle risposte con un set di domande etichettate. Per agenti con azioni scriventi usa approvazione, idempotency key e audit.

**Evals essenziali:** prepara fixture con richieste lecite, senza permessi, tool sconosciuti, dati obsoleti, prompt injection e timeout; misura *task success*, tool corretto, errori di autorizzazione, costi e latenza. Preferisci un workflow deterministico quando la sequenza è nota; non introdurre multi-agent solo perché possibile. [MCP: specification](https://modelcontextprotocol.io/specification), [OWASP LLM security](https://genai.owasp.org/llm-top-10/).

## Domande da colloquio

**Tool calling vs RAG?** Tool calling richiede operazioni strutturate; RAG recupera informazioni da documenti. Spesso si combinano.

**Cos'è un agente?** Un sistema che usa un modello per decidere passi o tool, guidato e controllato dall'applicazione.

**Prompt injection?** Tentativo di inserire istruzioni malevole in input/dati a bassa fiducia per alterare il comportamento del sistema.

**Come valuti un agente?** Successo del task, correttezza tool, sicurezza/autorizzazioni, qualità della risposta, latenza e costo.

**Quando NON usare un agente?** Quando regole e sequenza sono note: meglio un normale workflow verificabile.

**Approfondisci quando serve:** [OWASP — LLM Top 10](https://genai.owasp.org/llm-top-10/), [MCP — Introduction](https://modelcontextprotocol.io/introduction), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework). Il codice sopra verifica una richiesta di tool, ma non è un agente completo né sostituisce policy, sessioni e autorizzazioni lato server.
