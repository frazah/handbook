<!-- level: Preparazione dati -->
<!-- summary: Null, duplicati, tipi, outlier e assunzioni esplicite -->
# Pulizia e validazione dei dati

I dati sporchi non si «aggiustano» tutti allo stesso modo.  
Ogni scelta dipende dal significato della colonna e dall'impatto sulle metriche.

**Prima di leggere il codice — simboli e termini:**

- **`.loc` / `.iloc`**: accesso pandas rispettivamente per etichette o posizioni.

## Prima del codice: cosa riconoscere

`NaN` indica un valore mancante; non equivale a zero. `dropna` elimina record, `fillna` li sostituisce: entrambi cambiano il dataset e richiedono una scelta motivata.

```python
import pandas as pd
# Carica i dati del file CSV in una tabella pandas.
# read_csv legge un file esterno: colonne e tipi vanno verificati.
orders = pd.read_csv("orders.csv")
print(orders.isna().sum())
print(orders.duplicated(subset=["order_id"]).sum())

# Rimuovi solo i duplicati realmente accidentali:
orders = orders.drop_duplicates(subset=["order_id"])
# Con errors="coerce" i valori non numerici diventano NaN.
orders["quantity"] = pd.to_numeric(orders["quantity"], errors="coerce")
invalid = orders["quantity"].isna() | orders["quantity"].le(0)
# .loc[maschera, colonne] seleziona righe e colonne per etichetta.
print("Righe da verificare:", orders.loc[invalid, "order_id"].tolist())
```

## Quando mancano dei valori

- `dropna(subset=[...])`: scarta record privi di dati indispensabili.
- `fillna(0)`: solo se **mancante = realmente zero**, non per comodità.
- Imputazione media/mediana: spesso utile nel ML, ma solo dopo lo split e nel pipeline.
- Categoria `"Unknown"`: per attributi categorici quando ha significato.

## Outlier

Un ordine da €20.000 può essere errore oppure cliente enterprise.  
Analizza causa e distribuzione prima di tagliare i valori estremi.

**Regola:** mantieni una copia dei dati grezzi e logga le righe scartate; non nascondere il problema facendo sparire i record silenziosamente.
