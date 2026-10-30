# Data Science

> Dall'export grezzo a una risposta difendibile: pulizia con pandas, statistica per non farsi ingannare dai dati, machine learning con scikit-learn.
> Prerequisiti: [Python](../Languages/Python.md) · [SQL](../Languages/SQL.md) · Collegate: [Recipe pandas + SQL](../Recipes/pandas%20%2B%20SQL.md) · [AI Agents](AI%20Agents.md)

## Modello mentale

- Un'analisi parte da una **domanda** ("quali città generano più fatturato?"), non dai dati. La domanda decide metrica, granularità e periodo.
- Flusso tipico: **domanda → dati → pulizia → esplorazione (EDA) → modello o analisi → comunicazione**. La pulizia prende la maggior parte del tempo.
- **pandas** lavora per **colonne vettorizzate**: le operazioni su intere colonne girano in C (NumPy); i cicli Python riga per riga sono 10–100 volte più lenti.
- Ogni statistica è una **stima** con un'incertezza: un numero senza intervallo di confidenza o senza dimensione del campione vale poco.
- **Correlazione non è causalità:** per affermare un effetto causale serve un esperimento (A/B test) o un disegno che controlli i confondenti.
- In ML conta **generalizzare a dati mai visti**: tutto ciò che il modello impara (anche lo scaling) va calcolato solo sul training set, altrimenti hai **leakage** e metriche gonfiate.

## Sintassi al volo

| Ti serve | pandas |
|---|---|
| Leggere | `pd.read_csv("orders.csv", parse_dates=["created_at"])` · `pd.read_sql(q, conn)` |
| Ispezionare | `df.head()`, `df.info()`, `df.describe()`, `df["city"].value_counts()` |
| Selezionare | `df["amount"]` · `df[["city", "amount"]]` |
| Per etichetta / posizione | `df.loc[righe, colonne]` · `df.iloc[0:5, 0:2]` |
| Filtrare | `df[(df.status == "paid") & (df.amount > 10)]` (parentesi e `&`, non `and`) |
| Nuova colonna | `df.assign(amount_eur=df.amount_cents / 100)` |
| Mancanti | `df.isna().sum()` · `dropna(subset=[...])` · `fillna(0)` |
| Tipi | `pd.to_numeric(s, errors="coerce")` · `astype("category")` |
| Raggruppare | `df.groupby("city").agg(revenue=("amount", "sum"), orders=("id", "count"))` |
| Unire | `orders.merge(customers, on="customer_id", how="left", validate="many_to_one")` |
| Pivot | `df.pivot_table(index="month", columns="city", values="amount", aggfunc="sum")` |
| Date | `df.created_at.dt.to_period("M")` · `df.set_index("created_at").resample("W").sum()` |
| Ordinare | `df.sort_values("amount", ascending=False)` |

## NumPy essenziale

Array omogenei (un solo `dtype`) e operazioni vettorizzate. Il **broadcasting** estende automaticamente le dimensioni compatibili, senza copie esplicite.

```python
# illustrativo: richiede numpy
import numpy as np

# Ricavi (righe: prodotti, colonne: 3 mesi), in euro.
revenue = np.array([[120.0, 135.0, 150.0],
                    [80.0, 70.0, 95.0]])

revenue.sum(axis=0)        # -> [200. 205. 245.]  totale per mese (collassa le righe)
revenue.mean(axis=1)       # -> [135.  81.67]     media per prodotto (collassa le colonne)
revenue * np.array([1.0, 1.1, 1.0])  # broadcasting: (2,3) * (3,) applica il fattore per mese
```

## Pulizia e aggregazione con pandas

```python
# illustrativo: richiede pandas; CSV con colonne order_id, city, amount, status, created_at
import pandas as pd

df = pd.read_csv("orders.csv", parse_dates=["created_at"])

df = (
    df.drop_duplicates("order_id")                                  # export ripetuti
      .assign(
          amount=lambda d: pd.to_numeric(d.amount, errors="coerce"),  # "n/d" -> NaN, non crash
          city=lambda d: d.city.str.strip().str.title(),              # " milano" -> "Milano"
      )
      .query("status == 'paid' and amount >= 0")                     # NaN escluso dal confronto
)

report = (
    df.groupby("city", as_index=False)
      .agg(revenue=("amount", "sum"), orders=("order_id", "count"), avg=("amount", "mean"))
      .sort_values("revenue", ascending=False)
)
```

- **Method chaining** con `assign` e `query` evita variabili intermedie e i problemi di `SettingWithCopyWarning`. Con il copy-on-write di pandas 3 una selezione si comporta sempre come una copia.
- `groupby(...).transform("sum")` restituisce un valore **per riga** (es. la quota di ogni ordine sul totale della città), mentre `agg` restituisce una riga per gruppo.
- `merge(..., validate="many_to_one")` lancia un errore se la chiave a destra non è unica: previene righe duplicate silenziose.
- **Valori mancanti:** prima capisci *perché* mancano (errore di export? dato non applicabile?). Imputarli alla cieca (`fillna(0)`) altera medie e modelli.
- `apply` con una funzione Python riga per riga è lento: cerca prima un'operazione vettorizzata (`np.where`, `.str`, `.dt`, `cut`).

## Scegliere il grafico

| Domanda | Grafico |
|---|---|
| Andamento nel tempo | linea |
| Confronto tra categorie | barre (orizzontali se le etichette sono lunghe) |
| Distribuzione di una variabile | istogramma, box plot |
| Relazione tra due variabili numeriche | scatter plot |
| Parte di un totale (poche categorie) | barre impilate (meglio della torta) |

## Statistica

| Concetto | In breve |
|---|---|
| Media vs mediana | la media è sensibile agli outlier; per gli importi degli ordini la mediana è spesso più rappresentativa |
| Deviazione standard | dispersione media attorno alla media |
| Teorema del limite centrale | la media campionaria tende a una normale al crescere di `n`, qualunque sia la distribuzione di partenza: per questo funzionano intervalli e test sulle medie |
| Intervallo di confidenza al 95% | un procedimento che, ripetuto, contiene il valore vero nel 95% dei casi |
| p-value | probabilità di osservare un risultato almeno così estremo **se l'ipotesi nulla fosse vera**. Non è la probabilità che l'ipotesi nulla sia vera |
| Errore di I / II tipo | falso positivo (α) / falso negativo (β); la potenza è 1 − β |
| Correlazione | misura una relazione lineare, non la causalità; attenzione ai confondenti |

```python
import statistics as st

order_values = [18.5, 22.0, 19.9, 250.0, 21.3, 20.1]  # un ordine B2B anomalo
assert st.median(order_values) < st.mean(order_values)  # 20.7 vs 58.6: la media è trascinata

# IC al 95% della media (approssimazione normale; con n piccolo servirebbe la t di Student).
mean, sd, n = st.mean(order_values), st.stdev(order_values), len(order_values)
margin = 1.96 * sd / n ** 0.5
print(f"{mean:.1f} ± {margin:.1f}")  # -> 58.6 ± 75.0: con 6 ordini e un outlier, quasi nessuna informazione
```

### A/B test

Esempio: il nuovo checkout aumenta il tasso di conversione?

1. **Ipotesi e metrica** decise *prima*: conversione = ordini / sessioni.
2. **Dimensione del campione** calcolata in anticipo, in base all'effetto minimo che ti interessa rilevare, ad α e alla potenza (80% tipico).
3. **Randomizzazione** per utente, non per sessione, così lo stesso utente vede sempre la stessa variante.
4. Test (z-test su due proporzioni) **solo alla fine**: guardare i risultati ogni giorno e fermarsi al primo p < 0,05 (*peeking*) gonfia i falsi positivi.

```python
from statistics import NormalDist

def two_proportion_z_test(conv_a: int, n_a: int, conv_b: int, n_b: int) -> float:
    """p-value bilaterale per la differenza tra due tassi di conversione."""
    p_a, p_b = conv_a / n_a, conv_b / n_b
    pooled = (conv_a + conv_b) / (n_a + n_b)  # sotto H0 i tassi sono uguali
    se = (pooled * (1 - pooled) * (1 / n_a + 1 / n_b)) ** 0.5
    z = (p_b - p_a) / se
    return 2 * (1 - NormalDist().cdf(abs(z)))

p = two_proportion_z_test(conv_a=480, n_a=10_000, conv_b=560, n_b=10_000)
assert p < 0.05  # 4,8% vs 5,6%: differenza statisticamente significativa (p ≈ 0,01)
```

## Machine learning

| Concetto | In breve |
|---|---|
| Supervisionato / non supervisionato | con etichette (classificazione, regressione) / senza (clustering, riduzione dimensionale) |
| Train / validation / test | si addestra, si scelgono gli iperparametri, si misura **una volta** alla fine |
| Cross-validation | k fold a rotazione: stima più stabile con pochi dati. Per dati temporali usa `TimeSeriesSplit` |
| Overfitting | ottimo sul training, scarso su dati nuovi: modello troppo complesso o pochi dati |
| Bias-variance | modelli semplici sbagliano in modo sistematico (bias); modelli complessi sono instabili (varianza) |
| Regolarizzazione | penalizza la complessità: L2 (Ridge) riduce i pesi, L1 (Lasso) ne azzera alcuni |
| Leakage | informazioni non disponibili al momento della previsione finiscono nel training (scaling su tutto il dataset, feature "future", stesso cliente in train e test) |

### Pipeline scikit-learn

La `Pipeline` impara il preprocessing **solo sui dati di training** di ogni fold: è la difesa principale contro il leakage.

```python
# illustrativo: richiede pandas + scikit-learn
# Prevedere se un cliente farà un altro ordine entro 90 giorni (churn).
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

features = customers[["orders_count", "avg_order_cents", "days_since_last", "city"]]
target = customers["reordered_90d"]

model = Pipeline([
    ("prep", ColumnTransformer([
        ("num", StandardScaler(), ["orders_count", "avg_order_cents", "days_since_last"]),
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),  # città nuove in produzione: ok
    ])),
    ("clf", LogisticRegression(class_weight="balanced", max_iter=1000)),  # classi sbilanciate
])

scores = cross_val_score(model, features, target, cv=5, scoring="roc_auc")
print(scores.mean(), scores.std())
```

### Quale modello

| Modello | Quando |
|---|---|
| Regressione lineare / logistica | baseline, interpretabilità, pochi dati |
| Random forest | buon default su dati tabellari, poco tuning |
| Gradient boosting (XGBoost, LightGBM) | di solito il migliore su dati tabellari |
| k-means | segmentazione dei clienti (cluster sferici, va scelto k) |
| Reti neurali | testo, immagini, audio, dataset molto grandi |

### Metriche

| Metrica | Domanda a cui risponde |
|---|---|
| Accuracy | quante previsioni corrette? Ingannevole con classi sbilanciate |
| Precision | dei clienti che segnalo come a rischio, quanti lo sono davvero? |
| Recall | dei clienti davvero a rischio, quanti ne trovo? |
| F1 | media armonica di precision e recall |
| ROC AUC | quanto bene il modello ordina i positivi sopra i negativi, a qualsiasi soglia |
| MAE / RMSE | errore medio di una regressione (RMSE penalizza di più gli errori grandi) |

Con il 2% di frodi, un modello che dice sempre "non frode" ha il 98% di accuracy ed è inutile: guarda la matrice di confusione, precision/recall o PR AUC, e scegli la soglia in base al costo degli errori.

## Domande da colloquio

**Base**
- **`loc` vs `iloc`?** `loc` seleziona per etichetta (index e nomi di colonna, estremi inclusi); `iloc` per posizione intera (estremo finale escluso).
- **Media o mediana?** La mediana è robusta agli outlier e si usa per distribuzioni asimmetriche come redditi e importi; la media usa tutta l'informazione ma è sensibile ai valori estremi.
- **Come gestisci i valori mancanti?** Prima ne capisco la causa e la quantità; poi elimino, imputo (mediana, valore di gruppo, modello) o aggiungo un indicatore "mancante", documentando la scelta.
- **Supervisionato vs non supervisionato?** Il supervisionato impara da esempi etichettati (prevedere il churn); il non supervisionato cerca strutture senza etichette (segmentare i clienti con il clustering).
- **Quali distribuzioni conoscere?** Normale (misure continue, medie), binomiale (numero di successi su n prove: conversioni), Poisson (eventi in un intervallo: ordini all'ora), esponenziale (tempo tra eventi).

**Intermedio**
- **Cos'è un p-value?** La probabilità di vedere un risultato almeno così estremo se l'ipotesi nulla fosse vera. Un p piccolo indica che i dati sono poco compatibili con H0, non quanto è grande o importante l'effetto.
- **Cos'è l'overfitting e come lo eviti?** Il modello memorizza il rumore del training. Si contrasta con più dati, modelli più semplici, regolarizzazione, cross-validation ed early stopping.
- **Precision o recall?** Dipende dal costo degli errori: in una diagnosi conta il recall (non perdere i positivi), in un filtro antispam la precision (non bloccare email buone).
- **Cos'è il data leakage?** Informazione del test o del futuro che entra nel training. Esempi: scaling sull'intero dataset, feature calcolate dopo l'evento, lo stesso cliente sia in train sia in test.
- **`groupby().agg` vs `transform`?** `agg` restituisce una riga per gruppo; `transform` restituisce un valore per ogni riga originale, utile per confrontare ogni riga con il suo gruppo.

**Avanzato**
- **Bias-variance trade-off?** L'errore atteso si scompone in bias² + varianza + rumore. Aumentare la complessità riduce il bias e aumenta la varianza; si cerca il minimo con la validazione.
- **Come imposti un A/B test?** Ipotesi e metrica prima, dimensione del campione da effetto minimo, α e potenza, randomizzazione per utente, nessun peeking, controllo delle metriche guardrail e del *sample ratio mismatch*.
- **L1 vs L2?** L1 produce pesi esattamente a zero (selezione delle feature); L2 riduce tutti i pesi in modo uniforme ed è più stabile con feature correlate.
- **Come validi un modello su dati temporali?** Con split temporali (addestri sul passato, testi sul futuro), mai mescolando le date; feature calcolate solo con informazioni disponibili al momento della previsione.
- **Cos'è la power analysis?** Il calcolo della dimensione del campione necessaria per rilevare un effetto minimo con un dato α e una data potenza. Senza, un test "non significativo" può semplicemente avere troppi pochi dati.

## Approfondisci

- [pandas — User Guide](https://pandas.pydata.org/docs/user_guide/index.html) · [NumPy — Broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html)
- [scikit-learn — Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) · [Model evaluation](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [Trustworthy Online Controlled Experiments](https://experimentguide.com/) — riferimento sugli A/B test
