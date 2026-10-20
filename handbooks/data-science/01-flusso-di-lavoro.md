<!-- level: Basi -->
<!-- summary: Dalla domanda di business al report riproducibile -->
# Il flusso di lavoro: chiedi → raccogli → pulisci → analizza → comunica

## Analysis vs Data Science

**Data analysis** spiega *che cosa sta succedendo e perché*, attraverso dati, SQL, statistiche e visualizzazioni.  
**Data science** include inoltre esperimenti e modelli predittivi.  
Spesso un'analisi descrittiva ben fatta è più utile di un modello ML.

Caso reale: un e-commerce chiede «perché il fatturato è diminuito?».  
Definisci anzitutto le metriche: fatturato lordo? ordini pagati? periodo? rimborsi inclusi?  
Un grafico perfetto di una metrica sbagliata è inutile.

## I 7 passi

1. Domanda verificabile e metrica (`paid_revenue` mensile).
2. Raccolta da CSV, database, API, log. Annota provenienza e periodo.
3. Qualità: tipi, null, duplicati, valori impossibili, timezone.
4. EDA: distribuzioni, aggregazioni e differenze per segmento.
5. Ipotesi e verifica: stagionalità, mix prodotti, campagne.
6. Analisi replicabile: funzioni, ambiente e test.
7. Conclusione: insight, limiti, decisione e prossima verifica.

## Forma consigliata del progetto

```text
analysis/
├── data/raw/            # input originale, immutabile
├── data/processed/      # output della pipeline
├── src/                 # script e funzioni
├── reports/             # grafici, tabelle e sintesi
├── tests/
└── README.md            # domanda, metriche, istruzioni
```

**Da evitare:** cambiare manualmente un CSV e perdere le trasformazioni.  
Il risultato deve poter essere rigenerato dai dati originali.
