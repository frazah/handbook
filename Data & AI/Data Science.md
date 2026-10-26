# Data Science & Analysis — Cheatsheet

> **Quando serve:** esplorare dataset, pulire dati, trovare pattern, costruire report e valutare modelli ML. Esempi Python con NumPy, pandas, matplotlib e scikit-learn.

Il flusso tipico è **domanda → raccolta → validazione → pulizia → esplorazione → analisi/modello → valutazione → comunicazione**. Data Analysis spiega dati e decisioni; ML mira anche a generalizzare a dati nuovi.

## Sintassi al volo

| Obiettivo | pandas / NumPy |
|---|---|
| Leggere CSV | `pd.read_csv('orders.csv')` |
| Prime righe | `df.head()` |
| Struttura | `df.info()` |
| Statistiche | `df.describe()` |
| Mancanti | `df.isna().sum()` |
| Colonne | `df[['name', 'price']]` |
| Filtro | `df.loc[df['price'] > 10]` |
| Posizione | `df.iloc[0:5]` |
| Raggruppare | `df.groupby('city')['amount'].sum()` |
| Unire tabelle | `pd.merge(left, right, on='id')` |
| Pivot | `df.pivot_table(index='city', values='total', aggfunc='sum')` |

## Concetti applicati

### Pulizia e aggregazione (pandas)

```python
import pandas as pd

# CSV di un export e-commerce (colonne: order_id, city, amount, status).
# Per provarlo usa il file della Recipe "pandas + SQL".
orders = pd.read_csv('orders.csv')

# Non fidarti dei tipi dell'export: gestisci importi illeggibili.
orders['amount'] = pd.to_numeric(orders['amount'], errors='coerce')

# Prima controlliamo quali dati mancano: non rimpiazziamoli alla cieca.
print(orders.isna().sum())

# Filtriamo solo gli ordini pagati con importo noto.
paid = orders.loc[
    (orders['status'] == 'paid') & (orders['amount'].notna()) & (orders['amount'] >= 0)
].copy()

# groupby: raggruppa per città; sum: aggrega gli importi per gruppo.
revenue_by_city = paid.groupby('city', as_index=False)['amount'].sum()
print(revenue_by_city)
```

**Leggi la sintassi:** `df.loc[maschera, colonne]` seleziona per etichetta/condizione; `&` combina maschere booleane elemento per elemento (usa parentesi intorno alle condizioni). `.copy()` evita modifiche ambigue a viste/sottoinsiemi.

### Statistica da conoscere

- **Media vs mediana:** la media risente molto di outlier; la mediana è robusta.
- **Deviazione standard:** misura dispersione rispetto alla media.
- **Correlazione:** associazione statistica, non prova causalità.
- **Intervallo di confidenza:** procedura che copre il parametro vero con una frequenza nominale su campioni ripetuti; non è la probabilità del parametro fisso.
- **p-value:** probabilità di risultati almeno altrettanto estremi *assumendo l'ipotesi nulla*, non probabilità che l'ipotesi nulla sia vera.

### Machine learning minimo

```python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

from sklearn.datasets import load_wine

# Dataset didattico reale: analisi chimiche di vini, classi etichettate.
# È un benchmark, NON un campione rappresentativo di una produzione moderna.
X, y = load_wine(return_X_y=True)

# Lo split stratificato conserva circa la proporzione delle classi.
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

# La pipeline adatta scaler e classificatore SOLO sul training set.
model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(classification_report(y_test, predictions, zero_division=0))
```

**Attenzione:** mai calcolare scaler/imputer/feature selection su tutti i dati *prima* dello split: è **data leakage**. Con dati temporali usa split cronologici, non casuali.

---

```python
import matplotlib.pyplot as plt

# Il grafico si costruisce sui dati aggregati, non sulle righe grezze.
revenue_by_city.plot.bar(x='city', y='amount', legend=False)
plt.ylabel('Revenue')
plt.tight_layout()
plt.show()
```

Metriche da scegliere in base al problema: **classificazione** precision, recall, F1, ROC-AUC/PR-AUC; **regressione** MAE, RMSE, R². Fai prima una baseline semplice e confronta il modello su dati non visti.

### NumPy, preprocessing e cross-validation

NumPy lavora su **array con forma** (`shape`); operazioni vettorizzate evitano molti cicli Python. Il *broadcasting* combina dimensioni compatibili ma può generare array intermedi grandi: verifica la shape invece di indovinare.

```python
import numpy as np

# Ricavi (righe: prodotti; colonne: tre mesi), dati di report in euro.
monthly_sales = np.array([
    [120, 135, 142],
    [55, 61, 59],
], dtype=float)

revenue_per_product = monthly_sales.sum(axis=1)  # Somma le colonne.
monthly_growth = monthly_sales[:, 1:] - monthly_sales[:, :-1]
print(monthly_sales.shape, revenue_per_product, monthly_growth)
```

`axis=0` opera lungo le righe per ciascuna colonna; `axis=1` lungo le colonne per ciascuna riga. In pandas `merge(..., validate='many_to_one')` aiuta a scoprire join che moltiplicano righe per duplicati imprevisti; scegli `dropna` o `fillna` in base alla causa dei mancanti, non come passaggio automatico.

```python
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_wine

X, y = load_wine(return_X_y=True)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

# Ogni fold adatta lo scaler SOLO sul training del fold: niente leakage.
folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_validate(model, X, y, cv=folds, scoring=['accuracy', 'f1_macro'])
print(scores['test_f1_macro'].mean())
```

**Per feature categoriche:** usa `ColumnTransformer` con `OneHotEncoder(handle_unknown='ignore')`, unito a `Pipeline`, così trasformazioni e modello si adattano sempre sugli stessi fold. Su serie temporali o persone ripetute usa split temporali o per gruppi. Le metriche vanno scelte in relazione al costo degli errori: in dataset sbilanciati spesso PR-AUC/recall è più utile dell'accuracy. [scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html), [ColumnTransformer](https://scikit-learn.org/stable/modules/compose.html#columntransformer-for-heterogeneous-data).

## Domande da colloquio

**Data leakage?** Informazioni del test/futuro entrano nel training o nel preprocessing e falsano la valutazione.

**Overfitting?** Modello che si adatta ai dettagli del training, generalizzando male.

**Precision vs recall?** Precision: correttezza dei positivi predetti; recall: quota di positivi veri intercettati.

**JOIN vs concat in pandas?** `merge` combina tramite chiavi; `concat` accoda lungo un asse.

**A/B test?** Esperimento randomizzato con metrica e ipotesi definite prima, evitando interpretazioni post-hoc.

**Approfondisci quando serve:** [scikit-learn — Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) (data leakage, train/test), [pandas user guide](https://pandas.pydata.org/docs/user_guide/index.html) (merge/groupby/loc), [NIST Engineering Statistics](https://www.itl.nist.gov/div898/handbook/) (fondamenti statistici).
