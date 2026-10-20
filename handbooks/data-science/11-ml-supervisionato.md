<!-- level: Machine Learning -->
<!-- summary: Classificazione, regressione, baseline e metriche di valutazione -->
# ML supervisionato: target, baseline e metriche

**Classificazione:** scegliere una classe (es. cliente che abbandona: sì/no).  
**Regressione:** stimare un numero (es. domanda prevista il mese prossimo).

## Inizia sempre da una baseline

Se il 95% dei clienti non abbandona, una strategia che predice sempre «no» raggiunge 95% accuracy senza imparare nulla.  
Valuta le metriche che riflettono il costo degli errori.

**Prima di leggere il codice — simboli e termini:**

- **`X` / `y`**: `X` indica le variabili predittive; `y` il risultato da prevedere.
- **`.fit()`**: apprende parametri dai dati di addestramento; non usarlo sul test set.

```python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# Separa prima i dati di addestramento da quelli di test.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
# Il modello apprende i parametri dai soli dati di training.
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
print(confusion_matrix(y_test, predictions))
```

## Metriche da conoscere

- **Precision:** fra quelli previsti positivi, quanti lo sono davvero?
- **Recall:** fra i veri positivi, quanti ne trovi?
- **F1:** media armonica di precision e recall.
- **MAE:** errore assoluto medio in regressione, espresso nell'unità della target.
- **RMSE:** penalizza maggiormente gli errori grandi.

**Attenzione:** un'accuracy alta non basta su classi sbilanciate.
In sanità, credito o altre decisioni ad alto impatto, verifica anche gruppi e rischi.
