<!-- level: AI + Biologia -->
<!-- summary: Problemi ML nel dominio biologico e valutazione rigorosa -->
# Machine learning su dati biologici

Il ML in biologia si usa per **classificazione**, **regressione**, **clustering**, analisi di immagini e di sequenze.  
Prima di scegliere un algoritmo, definisci l'unità su cui vuoi generalizzare: nuove cellule, nuove persone, nuovi laboratori, nuove aree geografiche?

## Esempi leciti e realistici

| Domanda | Dato | Output |
| --- | --- | --- |
| Classificare immagini di foglie | Fotografie annotate | Categoria con incertezza |
| Stimare abbondanze da misure ambientali | Sensori + metadati | Valore previsto e intervallo |
| Raggruppare profili di espressione | Matrici RNA | Cluster da validare |
| Prioritizzare approfondimenti in sanità pubblica | Serie aggregate | Segnalazioni da verificare |

## Pipeline corretta

```text
Problema → definizione outcome → dataset e consensi → split appropriato
         → baseline semplice → ML → calibrazione + analisi per sottogruppi
         → validazione esterna → monitoraggio
```

**Metriche:** accuracy può ingannare con eventi rari; esamina sensibilità, specificità, precisione, recall, PR-AUC e **calibrazione**.  
In ambito clinico contano anche utilità, errori, equità e impatto sul lavoro dei professionisti.

**Esempio di leakage:** se immagini della stessa persona compaiono in train e test, il modello può riconoscere la persona invece del fenomeno.  
La validazione tra siti/laboratori differenti è spesso cruciale.

Un modello con performance eccellente su dati storici **non** è automaticamente adatto a decisioni mediche.
