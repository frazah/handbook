# Web e HTTP

> I fondamenti che ogni colloquio frontend o backend dà per scontati: HTTP, caching, autenticazione, CORS, design di API REST, sicurezza.
> Collegate: [FastAPI](../Web%20%26%20Backend/FastAPI.md) · [React](../Web%20%26%20Backend/React.md) · [Vue](../Web%20%26%20Backend/Vue.md)

## Modello mentale

- HTTP è un protocollo **richiesta/risposta stateless**: ogni richiesta porta con sé tutto il necessario (cookie, token). Lo "stato" della sessione vive altrove.
- Una richiesta = **metodo + URL + header + body opzionale**. Una risposta = **status code + header + body**.
- Gli header sono metadati che controllano il comportamento: formato (`Content-Type`), cache, autenticazione, CORS.
- **HTTPS** = HTTP dentro TLS: cifratura, integrità e autenticità del server tramite certificato.
- Il browser applica regole di sicurezza che `curl` ignora: **same-origin policy**, CORS, cookie `SameSite`. Molti "bug" di frontend nascono qui.
- REST è uno **stile**, non uno standard: risorse identificate da URL, manipolate con i metodi HTTP standard.

### Cosa succede quando digiti un URL

1. **DNS:** il nome (`shop.example.test`) viene risolto in un IP (cache del browser, del sistema, del resolver).
2. **TCP:** handshake con il server (HTTP/3 usa QUIC su UDP).
3. **TLS:** si negoziano le chiavi e si verifica il certificato.
4. **HTTP:** il browser invia `GET /` e riceve l'HTML.
5. **Rendering:** parsing di HTML e CSS, download di JS e immagini (altre richieste), costruzione di DOM e CSSOM, layout, paint.

## Sintassi al volo

### Anatomia di uno scambio

```http
POST /api/orders HTTP/1.1
Host: shop.example.test
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Idempotency-Key: 6f1c2a9e-checkout-42

{"items": [{"sku": "MUG-2", "quantity": 2}]}
```

```http
HTTP/1.1 201 Created
Location: /api/orders/101
Content-Type: application/json

{"id": 101, "status": "pending", "total_cents": 2598}
```

### Metodi

| Metodo | Uso | Safe | Idempotente |
|---|---|---|---|
| `GET` | leggere | ✅ | ✅ |
| `POST` | creare, azioni | ❌ | ❌ |
| `PUT` | sostituire per intero | ❌ | ✅ |
| `PATCH` | modificare in parte | ❌ | non garantito |
| `DELETE` | eliminare | ❌ | ✅ |

**Safe** = non modifica lo stato del server. **Idempotente** = ripetere la richiesta produce lo stesso stato finale, quindi un client può ritentarla senza rischi.

### Status code da conoscere

| Codice | Significato | Quando |
|---|---|---|
| 200 / 201 / 204 | OK / Created / No Content | lettura / creazione / delete |
| 301 / 302 / 304 | redirect permanente / temporaneo / non modificato | cambio di URL / login / cache valida |
| 400 | Bad Request | input malformato |
| 401 | Unauthorized | **non autenticato** (manca o non è valido il token) |
| 403 | Forbidden | autenticato ma **non autorizzato** |
| 404 / 409 | Not Found / Conflict | risorsa assente / stato in conflitto (es. ordine già spedito) |
| 422 | Unprocessable Content | validazione fallita (default di FastAPI) |
| 429 | Too Many Requests | rate limit superato |
| 500 / 502 / 503 | errore del server / gateway / non disponibile | bug / upstream rotto / sovraccarico |

### Versioni di HTTP

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Trasporto | TCP | TCP | QUIC (UDP) |
| Più richieste in parallelo | più connessioni | multiplexing su una connessione | multiplexing senza head-of-line blocking di TCP |
| Header | testo | compressi (HPACK) | compressi (QPACK) |

## Caching

Evita di riscaricare ciò che non è cambiato.

- `Cache-Control: max-age=3600`: il client può riusare la risposta per un'ora senza chiedere.
- `Cache-Control: no-store`: non salvare mai (dati sensibili). `no-cache` significa invece "salva, ma rivalida prima di usare".
- **Richieste condizionali:** il server invia `ETag: "v7"`; il client poi chiede con `If-None-Match: "v7"` e, se nulla è cambiato, riceve `304 Not Modified` senza body.
- `private` (solo il browser) vs `public` (anche CDN e proxy).

```bash
curl -i https://shop.example.test/api/products/42 -H 'If-None-Match: "v7"'
# -> HTTP/1.1 304 Not Modified   (il client riusa la copia che ha)
```

## Cookie, sessioni e token

| | Sessione server-side | Token (JWT) |
|---|---|---|
| Dove sta lo stato | sul server (DB, Redis); il cookie contiene solo un id | nel token firmato, lato client |
| Revoca | immediata (cancelli la sessione) | difficile fino alla scadenza: servono token brevi + refresh |
| Scalabilità | serve uno store condiviso | stateless, si verifica con la sola chiave |
| Tipico per | web app classiche | API, microservizi, mobile |

**Attributi dei cookie:**
- `HttpOnly`: inaccessibile da JS, quindi un XSS non può rubarlo.
- `Secure`: inviato solo via HTTPS.
- `SameSite=Lax|Strict|None`: limita l'invio nelle richieste cross-site, principale difesa CSRF moderna.

Un JWT è `header.payload.firma` in base64url: **firmato, non cifrato**. Chiunque può leggerne il payload, quindi non metterci segreti.

```python
import base64, json

token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJjdXN0b21lciJ9.firma"
payload = token.split(".")[1]
payload += "=" * (-len(payload) % 4)  # base64url senza padding
print(json.loads(base64.urlsafe_b64decode(payload)))  # -> {'sub': '42', 'role': 'customer'}
```

## OAuth 2.0 e OpenID Connect

- **OAuth 2.0** = *autorizzazione* delegata ("questa app può leggere i miei ordini"). **OIDC** aggiunge l'*autenticazione* ("chi è l'utente") tramite un `id_token`.
- Flusso consigliato per web e mobile: **Authorization Code + PKCE**.
  1. L'app genera un `code_verifier` casuale e ne invia l'hash (`code_challenge`) all'authorization server.
  2. L'utente fa login lì e l'app riceve un `code` monouso tramite redirect.
  3. L'app scambia il `code` + `code_verifier` con l'access token. Chi intercetta il `code` non ha il verifier e non può usarlo.
- Il flusso *Implicit* è deprecato.

## CORS

La **same-origin policy** impedisce a JS di leggere risposte da un'origine diversa (origine = schema + host + porta). **CORS** è il modo con cui il *server* dichiara quali origini possono farlo.

- Le richieste "non semplici" (es. `Content-Type: application/json`, header `Authorization`, metodi `PUT`/`DELETE`) causano una **preflight** `OPTIONS`.
- Il server risponde con `Access-Control-Allow-Origin: https://app.example.test` (mai `*` insieme alle credenziali).
- **CORS non protegge il server:** `curl` o un altro backend lo ignorano. Protegge gli *utenti*, impedendo a un sito malevolo di leggere dati con i loro cookie.

```http
OPTIONS /api/orders HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: content-type
```

## Design di API REST

| Regola | Esempio |
|---|---|
| Risorse come sostantivi al plurale | `GET /orders`, `GET /orders/101` |
| Relazioni annidate (un livello) | `GET /customers/7/orders` |
| Filtri, ordinamento e paginazione in query | `GET /orders?status=paid&sort=-created_at&limit=20` |
| Azioni che non sono CRUD | `POST /orders/101/cancel` |
| Versioning | `/v1/orders` o header `Accept` |
| Errori in formato coerente | RFC 9457 *Problem Details* |

**Paginazione:** l'offset (`?offset=40&limit=20`) è semplice ma lento su tabelle grandi e instabile se arrivano nuove righe. Il **cursore** (`?after=101`, keyset) è stabile e veloce (vedi [SQL](../Languages/SQL.md#paginazione-keyset)).

**Idempotency key:** per `POST` non ripetibili (pagamenti) il client invia un `Idempotency-Key`; il server salva la risposta e, se riceve la stessa chiave, la restituisce senza ripetere l'operazione.

```json
{
  "type": "https://shop.example.test/errors/out-of-stock",
  "title": "Prodotto esaurito",
  "status": 409,
  "detail": "MUG-2: richiesti 3, disponibili 1"
}
```

### REST, GraphQL, gRPC

| | REST | GraphQL | gRPC |
|---|---|---|---|
| Forma | più endpoint, risorse | un endpoint, il client sceglie i campi | chiamate a procedure tipizzate (Protobuf) |
| Pro | semplice, caching HTTP | niente over/under-fetching | veloce, streaming, contratti forti |
| Contro | più round-trip | caching e rate limit più complessi | poco adatto al browser |
| Ideale per | API pubbliche | frontend con viste molto diverse | comunicazione tra microservizi |

### Tempo reale

| Tecnica | Direzione | Quando |
|---|---|---|
| Polling | client → server a intervalli | aggiornamenti rari, massima semplicità |
| SSE (Server-Sent Events) | server → client, su HTTP | notifiche, stato di un ordine, streaming di token LLM |
| WebSocket | bidirezionale | chat, editing collaborativo, giochi |

## Rate limiting

Protegge da abusi e sovraccarico. Algoritmi tipici: *fixed window*, *sliding window*, **token bucket** (permette burst controllati). Si risponde `429` con `Retry-After`.

```python
import time

class TokenBucket:
    def __init__(self, rate_per_sec: float, capacity: int) -> None:
        self.rate, self.capacity = rate_per_sec, capacity
        self.tokens, self.last = float(capacity), time.monotonic()

    def allow(self) -> bool:
        now = time.monotonic()
        # ricarica i token maturati dall'ultima richiesta, senza superare la capacità
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

bucket = TokenBucket(rate_per_sec=1, capacity=3)
assert [bucket.allow() for _ in range(4)] == [True, True, True, False]
```

## Sicurezza web (OWASP essenziale)

| Attacco | Cos'è | Difesa |
|---|---|---|
| **XSS** | JS malevolo iniettato nella pagina | escaping dell'output (React/Vue lo fanno di default), niente `innerHTML`/`v-html` con input utente, CSP, cookie `HttpOnly` |
| **CSRF** | un sito terzo fa partire richieste con i cookie della vittima | `SameSite`, token anti-CSRF, token nell'header invece che nel cookie |
| **SQL injection** | input concatenato nella query | query parametrizzate ([SQL](../Languages/SQL.md#sql-injection-e-query-parametrizzate)) |
| **SSRF** | il server viene indotto a chiamare URL interni | allowlist di host, blocco degli IP privati |
| **Broken access control** | accedere a `/orders/102` di un altro utente | verificare la proprietà della risorsa *a ogni richiesta* |
| **Segreti esposti** | chiavi nel repo o nel bundle JS | variabili d'ambiente, secret manager, niente segreti nel frontend |

Le password non si cifrano: si salvano con un **hash lento con salt** (argon2, bcrypt).

## Domande da colloquio

**Base**
- **Differenza tra 401 e 403?** 401: non so chi sei (autenticazione mancante o non valida). 403: so chi sei ma non hai il permesso.
- **PUT vs PATCH?** PUT sostituisce l'intera risorsa ed è idempotente; PATCH applica modifiche parziali.
- **Cos'è l'idempotenza e perché conta?** Ripetere la richiesta non cambia il risultato finale. Permette retry sicuri dopo un timeout di rete.
- **Cosa succede quando digiti un URL?** DNS → TCP → TLS → richiesta HTTP → risposta → parsing e rendering, con le richieste aggiuntive per le risorse.
- **Cosa rende un'API RESTful?** Risorse identificate da URL, metodi HTTP usati secondo la loro semantica, comunicazione stateless, rappresentazioni (JSON) e risposte che sfruttano status code e caching HTTP.

**Intermedio**
- **Sessioni o JWT?** Le sessioni sono facili da revocare ma richiedono uno store condiviso; i JWT sono stateless ma difficili da revocare: si usano scadenze brevi e refresh token.
- **Cos'è CORS e cosa non fa?** Un meccanismo con cui il server autorizza origini diverse a leggere le risposte nel browser. Non è un controllo di accesso: le richieste da fuori del browser passano comunque.
- **Come funziona il caching con ETag?** Il server associa una versione alla risposta; il client la rimanda con `If-None-Match` e riceve `304` senza body se è invariata.
- **Offset o cursor pagination?** L'offset è semplice e permette di saltare a pagina N; il cursore è stabile con inserimenti concorrenti e resta veloce su tabelle grandi.
- **Cookie, localStorage o sessionStorage?** I cookie viaggiano automaticamente con le richieste e possono essere `HttpOnly` (adatti ai token di sessione); localStorage e sessionStorage sono leggibili da JS, quindi esposti a XSS: non sono adatti ai token sensibili.

**Avanzato**
- **Perché PKCE?** Impedisce che un authorization code intercettato venga scambiato per un token, perché serve il `code_verifier` noto solo al client originale.
- **XSS vs CSRF?** Con XSS l'attaccante esegue codice *nella* tua pagina; con CSRF sfrutta i cookie dell'utente da un'*altra* pagina. Le difese sono diverse (escaping e CSP vs SameSite e token).
- **Come rendi idempotente un pagamento?** Idempotency key salvata con vincolo di unicità e risposta memorizzata; un retry con la stessa chiave restituisce il risultato originale.
- **HTTP/2 vs HTTP/3?** HTTP/2 fa multiplexing su TCP ma soffre di head-of-line blocking a livello di trasporto; HTTP/3 usa QUIC su UDP, con stream indipendenti e handshake più rapido.

## Approfondisci

- [MDN — HTTP](https://developer.mozilla.org/docs/Web/HTTP) · [CORS](https://developer.mozilla.org/docs/Web/HTTP/CORS) · [Caching](https://developer.mozilla.org/docs/Web/HTTP/Caching)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) · [OAuth 2.0 Security Best Practice (RFC 9700)](https://www.rfc-editor.org/rfc/rfc9700)
- [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457)
