<!-- level: Basi -->
<!-- summary: venv, installazione, script, notebook e riproducibilità -->
# Ambiente, notebook e script

## Setup minimo

## Prima del codice: cosa riconoscere

Un notebook conserva celle in un ordine di esecuzione che può differire dall’ordine visualizzato: rilancia dall’inizio per verificare riproducibilità. Usa ambienti virtuali e versiona le dipendenze.

```bash
python -m venv .venv
# macOS/Linux: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install pandas numpy matplotlib scikit-learn jupyter pytest
python -m pip freeze > requirements.txt
```

**Notebook (`.ipynb`)**: ideale per esplorare celle e risultati.  
**Script (`.py`)**: ideale per trasformazioni riutilizzabili, test e automazione.  
Porta le funzioni consolidate fuori dal notebook in `src/`.

```python
from pathlib import Path
DATA_DIR = Path(__file__).resolve().parent / "data"
path = DATA_DIR / "orders.csv"
```

Usa sempre percorsi relativi al progetto, non percorsi assoluti del tuo computer.  
Committa solo dataset che puoi distribuire e **mai** password, credenziali, dati personali o `.env`.

## Checklist di riproducibilità

- Fissa un `random_state` nei passaggi stocastici.
- Documenta origine, licenza e data dei dataset.
- Indica come installare le dipendenze.
- Controlla versioni compatibili: alcune API cambiano.
- Inserisci controlli automatici per le trasformazioni critiche.
