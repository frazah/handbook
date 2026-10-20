<!-- level: Applicazioni -->
<!-- summary: Dalla domanda di ricerca a un prototipo verificabile e sicuro -->
# Un progetto interdisciplinare fatto bene

Esempio: **analisi di biodiversità e condizioni ambientali** con dati pubblici o sintetici.  
Scopo: osservare pattern in un dataset, **non** prendere decisioni sanitarie.

## Roadmap

1. Definisci la domanda: «Quali indicatori ambientali cambiano fra stagioni nei siti monitorati?».
2. Cerca collaboratori di dominio: ecologi/biologi; evita di inventare definizioni.
3. Definisci tabella con `site_id`, `week`, `count`, `effort`, `temperature` e metadati di raccolta.
4. Esegui QC su duplicati, unità, mancanti e metodi di campionamento.
5. Crea una **baseline descrittiva** con medie, distribuzioni e grafici.
6. Valuta se un modello ML risponde a una domanda reale meglio della baseline.
7. Verifica con dati indipendenti e interpreta insieme agli esperti.
8. Pubblica codice/test e una *data card*, senza rilasciare dati riservati.

## Struttura del mini progetto

## Prima del codice: cosa riconoscere

Un progetto interdisciplinare efficace definisce domanda, stakeholder, dataset, rischi, baseline, metriche, validazione e limiti prima di scegliere modelli complessi.

```text
project/
├── data/             # solo dati pubblicabili o sintetici
├── src/              # funzioni riutilizzabili
├── tests/            # test su invarianti, unità e edge case
├── reports/          # grafici e limiti dell'analisi
├── requirements.txt
└── README.md         # domanda, provenienza, metodo, risultati
```

**Qualità:** ripetibilità, conservazione delle versioni, valutazione dell'incertezza e comunicazione onesta degli errori.  
La biologia non è un dataset Kaggle con semantica garantita.
