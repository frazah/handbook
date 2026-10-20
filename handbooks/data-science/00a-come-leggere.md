<!-- level: Fondamenti -->
<!-- summary: Come leggere pandas, NumPy e il flusso ML prima dei primi esempi -->
# Prima della Data Science: leggere gli esempi Python

**Prerequisito:** Python di base.
Partiamo da un modello mentale: un **DataFrame** è una tabella di righe e colonne; una **Series** è una colonna indicizzata.

## Colonne e filtri pandas

```python
import pandas as pd

orders = pd.DataFrame({
    "category": ["libro", "penna", "libro"],
    "price": [20, 3, 12],
})

# orders["price"] prende una colonna (Series).
prices = orders["price"]

# Il confronto produce una serie di True/False, uno per riga.
is_expensive = orders["price"] > 10

# .loc[righe, colonne] seleziona tramite etichette/maschere.
# .loc[maschera, colonne] seleziona righe e colonne per etichetta.
expensive = orders.loc[is_expensive, ["category", "price"]]
print(expensive)
```

`&` e `|` combinano **maschere booleane**: metti ogni confronto fra parentesi.
`and` e `or` non funzionano per confronti elemento per elemento.

## Raggruppare e unire tabelle

```python
# Una riga per categoria, con somma dei prezzi.
report = (
    # groupby forma gruppi: la successiva aggregazione li riassume.
    orders.groupby("category")
    .agg(revenue=("price", "sum"))
    .reset_index()
)
```

Il punto all'inizio di una riga continua la chiamata dell'oggetto precedente perché siamo dentro `(...)`.
Le parentesi non creano una tupla qui: servono a spezzare una *method chain* in più righe.

## `fit`, `predict` e la differenza fra training e test

- `X`: caratteristiche usate per predire; `y`: risposta corretta (*target*).
- `fit(X_train, y_train)`: apprende **solo** dai dati di addestramento.
- `predict(X_test)`: produce previsioni su dati non visti.
- `transform(X_test)`: applica trasformazioni apprese sul training.

**Attenzione alla data leakage:** non calcolare statistiche su test e training insieme prima di addestrare.
Usa `Pipeline` e valuta su dati davvero separati.
