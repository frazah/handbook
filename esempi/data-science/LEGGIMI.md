# Laboratorio Data Science — vendite e-commerce

Analizza 24 ordini fittizi, distinguendo pagati, annullati, rimborsati e una riga invalida. **Nessun dato personale reale.**

```bash
# nella cartella del laboratorio
python -m pip install -r requirements.txt
python analyze_orders.py
python -m pytest -q
```

Lo script produce `reports/category-revenue.csv`, `monthly-revenue.csv` e un grafico PNG. Comincia dalle funzioni `load_valid_orders()` e `summarize_paid()`; gli output sono derivati e non richiedono commit.

Domande: qual è il fatturato pagato per categoria? Perché un ordine rimborsato non va contato qui? Quale differenza c'è fra fatturato lordo, netto e rimborsato?
