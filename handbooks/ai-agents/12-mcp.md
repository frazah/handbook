<!-- level: Orchestrazione -->
<!-- summary: MCP client/server, strumenti, risorse e autorizzazioni -->
# MCP: collegare agenti a strumenti e risorse

Il **Model Context Protocol (MCP)** descrive interfacce standard fra applicazioni AI e sorgenti/strumenti esterni.  
Distingui **host**, **client MCP** e **server MCP**.

**Prima di leggere il codice — simboli e termini:**

- ***MCP***: protocollo per esporre strumenti e risorse a client compatibili.

## Prima del codice: cosa riconoscere

MCP definisce un protocollo di collegamento fra un host, client e server. Il protocollo standardizza capacità ma non assegna automaticamente fiducia o autorizzazioni.

```text
App / agente (host)
       |
   MCP client
       |
   MCP server — strumenti, risorse, prompt
       |
  servizi / dati esterni
```

Esempio: un server MCP potrebbe esporre `search_tickets(query)` e la risorsa `support_policy`.  
L'agente scopre e usa capacità dichiarate dal server anziché implementare una nuova integrazione per ogni applicazione.

## Cosa controllare

- Ti fidi del server e del suo operatore?
- Quali credenziali usa e con quali permessi?
- Quali tool hanno effetti reali?
- L'utente ha consentito l'accesso ai suoi dati?
- Come vengono gestiti logging, timeout, rete e versioni?

**MCP non rende automaticamente sicuri i tool**.  
È un protocollo di integrazione, non una garanzia di autorizzazione.

Documento ufficiale: [Model Context Protocol](https://modelcontextprotocol.io/introduction).
