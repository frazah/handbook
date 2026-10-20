<!-- level: Basi -->
<!-- summary: ndarray, shape, slicing, broadcasting e calcolo vettorizzato -->
# NumPy: array e operazioni vettorizzate

Un `ndarray` contiene elementi dello stesso `dtype` in una struttura multidimensionale; le operazioni vettoriali spesso sostituiscono i loop Python.

## Prima del codice: cosa riconoscere

Un `ndarray` NumPy ha forma (*shape*) e tipo degli elementi (*dtype*). Le operazioni *vettorizzate* applicano calcoli a più valori; il **broadcasting** combina forme compatibili secondo regole precise.

```python
import numpy as np
prices = np.array([12.0, 25.0, 8.5])
quantities = np.array([3, 1, 4])
revenue = prices * quantities       # operazione elemento per elemento
print(revenue, revenue.sum())        # [36, 25, 34] -> 95
print(revenue.shape, revenue.dtype)  # (3,), float64 (di norma)
```

## Shape e assi

```python
sales = np.array([[10, 12, 8], [7, 11, 9]])  # 2 negozi × 3 mesi
print(sales.shape)           # (2, 3)
print(sales.sum(axis=0))     # totale per mese
print(sales.sum(axis=1))     # totale per negozio
```

`axis=0` riduce le righe, `axis=1` le colonne. `a[0, :]` legge la prima riga; `a[:, 1]` la seconda colonna.

## Broadcasting

```python
net = sales * np.array([0.9, 0.95, 1.0])
```

La terna dei moltiplicatori si applica a ogni riga: NumPy allinea le dimensioni da destra, purché siano uguali o una sia 1.

**Attenzione:** slice e view possono condividere memoria; usa `.copy()` se devi modificare dati senza toccare l'originale.
I `NaN` richiedono funzioni adeguate come `np.nanmean`.
