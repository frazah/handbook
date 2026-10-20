<!-- level: Machine Learning -->
<!-- summary: Segmentazione KMeans, standardizzazione e PCA -->
# Non supervisionato: cluster e dimensioni

Nel **clustering** non hai una target nota: cerchi gruppi di osservazioni simili.  
Esempio: segmentare utenti per frequenza d'acquisto e scontrino medio.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

features = [[1, 20], [2, 24], [14, 150], [12, 140]]
scaled = StandardScaler().fit_transform(features)
clusters = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(scaled)
print(clusters)
```

I numeri dei cluster non hanno un significato intrinseco: il cluster `0` non è «migliore» del `1`.  
Interpreta i centroidi sulle scale originali.

**PCA** combina variabili in componenti ortogonali che spiegano una parte della varianza: utile per compressione/esplorazione, non garantisce cluster semanticamente significativi.

**Cautela:** il risultato cambia con metrica, scala e iperparametri; un cluster statistico non è necessariamente un segmento di business realmente utile.
