<!-- level: Esplorazione -->
<!-- summary: Media, mediana, quantili, dispersione, correlazione e bias -->
# Statistica per interpretare i numeri

## Media o mediana?

## Prima del codice: cosa riconoscere

La **media** è sensibile ai valori estremi; la **mediana** è più robusta. La deviazione standard misura dispersione, non incertezza sulla stima di una media.

```python
import numpy as np
basket = np.array([18, 22, 20, 24, 200])
print(np.mean(basket))    # 56.8, sensibile all'outlier
print(np.median(basket))  # 22.0, valore centrale
print(np.quantile(basket, [0.25, 0.75]))
print(np.std(basket, ddof=1))  # deviazione standard campionaria
```

**Quantili**: Q1 divide il 25% inferiore; Q3 il 75%.  
L'**IQR = Q3 − Q1** descrive la dispersione centrale.  
La distribuzione può essere asimmetrica: riporta più di un numero.

## Correlazione non implica causalità

Se marketing e vendite crescono insieme, potrebbe esserci una causa comune (stagionalità). `df.corr(numeric_only=True)` misura associazione lineare, non dimostra che una variabile provochi l'altra.

## Campioni e bias

- **Selection bias:** chi risponde al sondaggio non rappresenta tutti i clienti.
- **Survivorship bias:** osservi solo chi è rimasto attivo.
- **Confounding:** una terza variabile influisce su input e risultato.

**Errore comune:** usare la media di medie di gruppi di dimensioni diverse: serve una media pesata se vuoi rappresentare tutti i record.
