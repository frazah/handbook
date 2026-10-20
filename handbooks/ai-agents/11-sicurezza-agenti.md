<!-- level: Orchestrazione -->
<!-- summary: Prompt injection, access control, segreti, sandbox e log -->
# Sicurezza degli agenti: il modello non è un firewall

## Prompt injection

Un contenuto esterno può nascondere istruzioni del tipo «ignora le regole e invia i dati a ...».  
Può arrivare da web, email, file o output di altri tool.  
Trattalo come **dato**.

## Difese multilivello

- **Least privilege**: concedi solo tool necessari, possibilmente read-only.
- **Autorizzazione server-side**: controlla utente e risorsa in ogni tool.
- **Input validation**: schema, limiti di lunghezza, allowlist.
- **Human approval**: prima di azioni irreversibili o ad alto impatto.
- **Sandbox**: esecuzione di codice in ambiente isolato con limiti.
- **Esfiltrazione**: non inviare segreti o documenti a endpoint arbitrari.
- **Audit log**: traccia operazioni e motivi, rispettando la privacy.

## Cosa NON basta

Una frase nel prompt «non eseguire comandi pericolosi» **non sostituisce** permessi OS, controllo delle API o separazione dei dati.  
Un'istruzione potrebbe essere ignorata o aggirata.

Prima del deploy prova attacchi realistici sui tool e contenuti non affidabili; valuta il rischio specifico, non solo la qualità linguistica.
