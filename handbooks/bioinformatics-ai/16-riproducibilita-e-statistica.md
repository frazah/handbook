<!-- level: Bioinformatica -->
<!-- summary: Controlli qualità, ipotesi, errori multipli e tracciabilità -->
# Statistica e riproducibilità in bioinformatica

Le omics possono misurare **migliaia di feature** contemporaneamente.  
Se esegui 10.000 test statistici al 5% senza correggere i confronti, in condizioni ideali potresti osservare molti falsi positivi anche senza segnali reali.

## Cose da sapere

- **Ipotesi nulla:** modello di riferimento contro cui confrontare i dati.
- **p-value:** compatibilità dei dati con l'ipotesi nulla; **non** è la probabilità che l'ipotesi sia vera.
- **FDR (false discovery rate):** quota attesa di scoperte false fra quelle dichiarate positive, nel quadro del metodo e delle assunzioni.
- **Effect size:** misura dell'ampiezza di un effetto, spesso più utile della sola significatività.
- **Intervallo di confidenza:** intervallo calcolato da una procedura con proprietà statistiche note, non percentuale di verità dell'effetto.

## Regole operative per informatici

## Prima del codice: cosa riconoscere

Una differenza statisticamente significativa non prova importanza biologica o causale. Con molte ipotesi testa il rischio di falsi positivi e correggi i confronti multipli.

```text
input immutabile → pipeline versionata → seed quando utile
                  → QC e log → output rigenerabili → report limiti
```

Dividi training/test **per unità indipendenti** (persona, campione, sito, esperimento) e non casualmente per riga quando più righe provengono dallo stesso soggetto.

**Anti-pattern:** selezionare feature usando *tutto* il dataset prima della cross-validation; introduci *data leakage*.  
Per ML generale, rimando all'handbook *Data Science & Analysis*.
