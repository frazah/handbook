<!-- level: Machine Learning -->
<!-- summary: Variabili predittive, split temporale, encoding e data leakage -->
# Feature engineering e prevenzione del leakage

Una **feature** è una variabile disponibile quando dovrai effettuare la previsione.  
La **target** è ciò che vuoi prevedere.

Esempio: prevedere se un ordine sarà restituito. `category`, `price` e `delivery_type` potrebbero essere disponibili subito; `refund_date` no: è informazione del futuro e causerebbe **leakage**.

## Preprocessing dentro un pipeline

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

features = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")),
                      ("scale", StandardScaler())]), ["price", "quantity"]),
    ("category", OneHotEncoder(handle_unknown="ignore"), ["category"]),
])
```

Fitta imputazione, scaling ed encoding **solo sul training set**: il pipeline si occuperà di riapplicare le trasformazioni al test senza imparare da esso.

## Split temporale

Se i dati hanno un ordine temporale, allena sul passato e valuta su periodi successivi; un `train_test_split` casuale può simulare conoscenza del futuro.
