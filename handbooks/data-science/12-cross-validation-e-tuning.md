<!-- level: Machine Learning -->
<!-- summary: Cross-validation, pipeline, confronto modelli e test finale -->
# Cross-validation e tuning senza barare

Dividi idealmente i dati in **training**, **validation** (anche via CV) e **test finale**.  
Il test finale serve a stimare le prestazioni su dati nuovi, non a scegliere l'iperparametro migliore.

**Prima di leggere il codice — simboli e termini:**

- **`X` / `y`**: `X` indica le variabili predittive; `y` il risultato da prevedere.
- **`.fit()`**: apprende parametri dai dati di addestramento; non usarlo sul test set.

## Prima del codice: cosa riconoscere

Nella cross-validation il modello viene riaddestrato su partizioni diverse del training. Il test finale resta isolato: usarlo per scegliere parametri falserebbe la valutazione.

```python
from sklearn.model_selection import StratifiedKFold, cross_validate, GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# La pipeline applica le trasformazioni e il modello nello stesso flusso.
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_validate(pipe, X_train, y_train, cv=cv,
                        scoring=["f1", "balanced_accuracy"])
print(scores["test_f1"].mean())

search = GridSearchCV(pipe, {"logisticregression__C": [0.1, 1, 10]},
                      cv=cv, scoring="f1")
search.fit(X_train, y_train)
print(search.best_params_)
# Valuta qui sul test solo quando le scelte sono definitive.
```

CV ordinaria mescola implicitamente osservazioni; per gruppi dello stesso utente o serie temporali, usa split rispettosi di gruppo e tempo.

**Data leakage:** un metodo di selezione feature, scaling o imputazione svolto sull'intero dataset prima della CV può contaminare la validazione.  
Racchiudi i passaggi nel pipeline.
