<!-- level: Reference -->
<!-- summary: Comandi pandas, NumPy, grafici e scikit-learn in una pagina -->
# Data Science & Analysis — Cheatsheet

## Orientamento rapido

| Hai bisogno di… | Usa… |
|---|---|
| Tabelle, CSV, aggregazioni, join | `pandas` |
| Array numerici e broadcasting | `numpy` |
| Grafici controllabili | `matplotlib` |
| Esplorazione di distribuzioni | `seaborn` (opzionale) |
| Test statistici e distribuzioni | `scipy.stats` |
| Preprocessing e modelli ML | `scikit-learn` |

```python
import pandas as pd
import numpy as np

# read_csv legge un file esterno: colonne e tipi vanno verificati.
df = pd.read_csv("orders.csv", parse_dates=["date"])
print(df.head(), df.info(), df.describe(numeric_only=True))
print(df.isna().sum())                  # valori mancanti
print(df.duplicated().sum())            # righe duplicate
# .loc[maschera, colonne] seleziona righe e colonne per etichetta.
paid = df.loc[df["status"] == "paid"].copy()
paid["revenue"] = paid["quantity"] * paid["price"]
# groupby forma gruppi: la successiva aggregazione li riassume.
monthly = paid.groupby(pd.Grouper(key="date", freq="MS"))["revenue"].sum()
print(monthly)
```

**Trucco:** `df.loc[condizione, colonne]` seleziona per etichetta; `df.iloc[righe, colonne]` seleziona per posizione. `groupby().agg()` aggrega, `merge()` unisce tabelle, `pivot_table()` crea riepiloghi multidimensionali.

## ML senza contaminazione dati

```python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# Dividi i dati PRIMA di addestrare il modello: il test deve restare indipendente.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
# La pipeline applica le trasformazioni e il modello nello stesso flusso.
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
# fit impara esclusivamente dai dati di training.
model.fit(X_train, y_train)
print(model.score(X_test, y_test))
```

Il test set non va usato per scegliere parametri o feature.  
Guarda le lezioni su leakage e cross-validation.

---

## Pandas e NumPy: sintassi frequente

| Operazione | Sintassi |
|---|---|
| CSV | `pd.read_csv('file.csv')` |
| Excel | `pd.read_excel('file.xlsx')` (engine richiesto) |
| Prime righe | `df.head()` |
| Struttura | `df.info()`, `df.dtypes`, `df.shape` |
| Statistiche | `df.describe(include='all')` |
| Nulle | `df.isna().sum()` |
| Duplicati | `df.duplicated().sum()` |
| Selezione colonne | `df[['id','price']]` |
| Filtro | `df.loc[df['price'] > 10, ['id','price']]` |
| Posizione | `df.iloc[:5, :2]` |
| Nuova colonna | `df['revenue'] = df['qty'] * df['price']` |
| Sostituisci NULL | `df['city'].fillna('unknown')` |
| Join | `df.merge(other, on='id', how='left', validate='many_to_one')` |
| Aggregazione | `df.groupby('category')['price'].mean()` |
| Più metriche | `df.groupby('category').agg(n=('id','size'), avg=('price','mean'))` |
| Date | `pd.to_datetime(df['date'], errors='coerce')` |
| Salva | `df.to_csv('clean.csv', index=False)` |
| NumPy array | `np.array([1,2,3])` |
| Maschera | `array[array > 2]` |

```python
import pandas as pd

# I valori mancanti non vanno scartati senza valutarne il significato.
# read_csv legge un file esterno: colonne e tipi vanno verificati.
df = pd.read_csv('orders.csv')
df['revenue'] = df['qty'] * df['unit_price']
# .loc[maschera, colonne] seleziona righe e colonne per etichetta.
paid = df.loc[df['status'] == 'paid'].copy()
# groupby forma gruppi: la successiva aggregazione li riassume.
summary = paid.groupby('category').agg(orders=('order_id', 'size'), revenue=('revenue', 'sum'))
print(summary.sort_values('revenue', ascending=False))
```

## Statistica, ML e prevenzione errori

| Ti serve | Strumento |
|---|---|
| Mediana | `df['price'].median()` |
| Percentile | `df['price'].quantile(0.95)` |
| Correlazione | `df[['a','b']].corr()` (non causalità) |
| Istogramma | `ax.hist(values, bins=20)` |
| Scatter | `ax.scatter(x, y)` |
| Train/test split | `train_test_split(X, y, test_size=.2, random_state=42)` |
| Pipeline | `make_pipeline(StandardScaler(), LogisticRegression())` |
| Fit | `model.fit(X_train, y_train)` |
| Predict | `model.predict(X_test)` |
| Valutazione classificazione | `classification_report(y_test, preds)` |
| Valutazione regressione | `mean_absolute_error(y_test, preds)` |
| Cross-validation | `cross_val_score(model, X_train, y_train, cv=5)` |

**Attenzione:** dividi i dati **prima** di imparare trasformazioni; evita leakage e confronta sempre la baseline.  
Se i dati sono temporali, usa split temporali anziché shuffle casuale.

---

## Pattern pandas / NumPy / ML in tre passaggi

### Leggere → filtrare → aggregare

```python
import pandas as pd

orders = pd.read_csv("orders.csv")

# Una maschera booleana ha un True/False per ogni riga.
is_paid = orders["status"] == "paid"

# .loc[righe, colonne]: usa la maschera per filtrare.
paid = orders.loc[is_paid, ["category", "amount"]].copy()

# Raggruppa per categoria, somma amount e ottieni una tabella.
summary = (
    paid.groupby("category")
    .agg(revenue=("amount", "sum"))
    .reset_index()
)
```

### Le operazioni che tornano sempre

| Obiettivo | Sintassi |
|---|---|
| Prime righe | `df.head(5)` |
| Dimensioni | `df.shape` |
| Tipi | `df.dtypes` |
| Mancanti | `df.isna().sum()` |
| Distribuzione | `df["status"].value_counts(dropna=False)` |
| Selezione per nome | `df.loc[mask, ["a", "b"]]` |
| Selezione per posizione | `df.iloc[:5, :3]` |
| Conversione numerica | `pd.to_numeric(df["price"], errors="coerce")` |
| Merge | `df.merge(other, on="id", how="left")` |
| Gruppi | `df.groupby("category").agg(total=("amount", "sum"))` |
| Date | `pd.to_datetime(df["date"], errors="coerce")` |

### NumPy: la forma cambia il risultato

```python
import numpy as np

prices = np.array([10, 20, 30], dtype=float)

# Operazione vettoriale: somma 2 a ogni elemento.
updated = prices + 2

# shape descrive le dimensioni dell'array.
print(updated.shape)  # (3,)
```

### Machine learning: pipeline e split

```python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# X e y devono provenire da un dataset già preparato.
# Separa dati prima di stimare statistiche di normalizzazione.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Lo scaler viene addestrato SOLO sul training, dentro la pipeline.
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)
score = model.score(X_test, y_test)
```

`X` e `y` in quest'ultimo frammento sono **input da preparare**, non variabili create nell'esempio.
Per dati temporali o di pazienti usa uno split rispettoso dei gruppi e dell'ordine cronologico.
