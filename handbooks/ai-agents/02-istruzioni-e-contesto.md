<!-- level: Fondamenti -->
<!-- summary: System instructions, contesto, limiti e separazione dati/istruzioni -->
# Istruzioni, contesto e confini

Un buon prompt non è solo «sei un agente esperto».  
Definisci **ruolo, compito, dati disponibili, limiti e forma dell'output**.

**Prima di leggere il codice — simboli e termini:**

- ***Tool calling***: il modello propone un’azione, ma il codice dell’app la valida e la esegue.

```text
Ruolo: assistente per lo stato degli ordini.
Obiettivo: spiegare i dati restituiti dai tool.
Vincoli: non inventare date di consegna né stato dei rimborsi.
Se manca l'ID ordine, chiedilo.
Non eseguire rimborsi, cancellazioni o scritture.
Rispondi in italiano, in modo sintetico.
```

## Metti i dati nella loro posizione

Il testo letto da pagine web, ticket o PDF è **dato non affidabile**, non una nuova istruzione di sistema.  
Un ticket può contenere «ignora tutte le istruzioni»: il modello non deve eseguirlo.

## Il contesto costa

Ogni turno, tool output e documento aggiunge token.  
Usa filtri, riassunti verificati e limiti per non accumulare intere conversazioni inutilmente.  
Se una risposta dipende da un'informazione reale, preferisci una **fonte attuale** fornita da un tool rispetto alla memoria del modello.
