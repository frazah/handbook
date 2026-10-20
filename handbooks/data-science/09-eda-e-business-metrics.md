<!-- level: Esplorazione -->
<!-- summary: EDA, KPI, metriche di business e segmentazione -->
# Exploratory Data Analysis (EDA) e metriche

L'EDA serve a **porre domande ai dati** prima di scegliere un metodo più complesso.

**Prima di leggere il codice — simboli e termini:**

- **`DataFrame` / `df`**: tabella in pandas; `df` è solo un nome di variabile convenzionale.

```python
import pandas as pd
# Carica i dati del file CSV in una tabella pandas.
df = pd.read_csv("orders.csv")
print(df.shape)
print(df.isna().mean().sort_values(ascending=False))
print(df["status"].value_counts(normalize=True))
```

## Esempio: conversion funnel

- `visits`: sessioni con una vista prodotto.
- `add_to_cart`: sessioni con aggiunta al carrello.
- `purchases`: sessioni con acquisto completato.
- `conversion_rate = purchases / visits` (se denominatori coerenti).

Controlla che i numeratori si riferiscano alla **stessa unità**: ordini e utenti non sono intercambiabili.

## Metriche comuni

- AOV = ricavi / ordini pagati.
- ARPU = ricavi / utenti attivi nel periodo.
- Retention = utenti di una coorte che tornano nel periodo definito.
- Churn = quota di utenti persi secondo una definizione esplicita.

## Checklist da analista

Distribuzione per categoria, andamento temporale, outlier, valori null, duplicati, bias di campionamento, effetti di campagne e differenze fra nuove e vecchie coorti.
