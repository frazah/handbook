<!-- level: Workflow reale -->
<!-- summary: Insight, limiti, notebook vs pipeline, portfolio e reporting -->
# Comunicare un'analisi che porta a una decisione

Un report utile risponde in ordine a quattro domande:

1. **Cosa osserviamo?** «Il fatturato degli ordini pagati è −12% mese su mese».
2. **Dove succede?** «Il calo è concentrato nella categoria Tech».
3. **Quanto siamo sicuri?** «Dati incompleti per l'ultima settimana; effetto promozioni da verificare».
4. **Cosa suggeriamo?** «Analizzare conversione e disponibilità a magazzino».

## Output ideale

## Prima del codice: cosa riconoscere

Un report deve separare osservazioni, interpretazioni e decisioni. Dichiara periodo, fonte, unità di misura, segmenti, limiti e grado di incertezza.

```text
reports/
├── executive-summary.md
├── kpi-by-month.csv
└── revenue-by-category.png
```

**Pattern:** dati grezzi → trasformazioni versionate → tabella validata → figure → sintesi.

Non confondere **insight** («la metrica cambia») con **causa** («cambia a causa di X») se manca un disegno sperimentale o un'analisi causale adeguata.

Per un portfolio, inserisci README con domanda, dataset (o generatore sintetico), riproduzione, scelte, grafici, limiti e prossimi passi.  
Il laboratorio `esempi/data-science/` segue questa logica.
