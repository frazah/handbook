<!-- level: Machine Learning -->
<!-- summary: Serie temporali, A/B test, intervalli e decisioni corrette -->
# Serie temporali e A/B test

## Analizzare il tempo

**Prima di leggere il codice — simboli e termini:**

- **`DataFrame` / `df`**: tabella in pandas; `df` è solo un nome di variabile convenzionale.
- **`.loc` / `.iloc`**: accesso pandas rispettivamente per etichette o posizioni.

```python
import pandas as pd
# Carica i dati del file CSV in una tabella pandas.
df = pd.read_csv("orders.csv", parse_dates=["date"])
paid = df.loc[df["status"] == "paid"].copy()
paid["revenue"] = paid["quantity"] * paid["price"]
monthly = paid.set_index("date")["revenue"].resample("MS").sum()
rolling = monthly.rolling(3, min_periods=1).mean()
```

Una media mobile leviga il rumore ma non predice da sola.  
Non fare split casuale su serie temporali: lo scenario reale è *passato → futuro*.

## Esperimento A/B

Ipotesi: cambiare il pulsante aumenta la conversione.  
Definisci prima **metrica primaria, unità di randomizzazione, durata, dimensione campione e criteri di stop**.

- Gruppo A: esperienza attuale; B: variante.
- Randomizza per utente se più sessioni appartengono allo stesso utente.
- Analizza differenze assolute, relative e intervalli di confidenza.
- Un p-value piccolo non quantifica la grandezza dell'effetto, né garantisce rilevanza pratica.

**Non guardare il p-value ogni ora e fermarti al primo valore significativo** senza un metodo sequenziale appropriato.
