# File, JSON, CSV e pathlib

**Idea.** `pathlib.Path` semplifica i percorsi su macOS/Windows/Linux.
Usa `with` per chiudere automaticamente i file.

## Prima del codice: cosa riconoscere

`Path("file.csv")` rappresenta un percorso, non apre automaticamente il file. `with` chiude risorse quando il blocco termina; JSON rappresenta valori compatibili con il formato, mentre CSV è testo tabellare e va interpretato.

```python
from pathlib import Path
import json
import csv

base = Path(__file__).resolve().parent
file_path = base / "sales.json"
sales = [{"name": "Tastiera", "amount": 49.9}]
# dumps serializza oggetti Python in testo JSON.
file_path.write_text(json.dumps(sales, ensure_ascii=False, indent=2), encoding="utf-8")
# Converte un testo JSON in oggetti Python.
# loads converte testo JSON in oggetti Python.
loaded = json.loads(file_path.read_text(encoding="utf-8"))

with (base / "sales.csv").open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "amount"])
    writer.writeheader()
    writer.writerows(loaded)
```

**Quando usarlo:** import/export, report, automazione di file, raccolta dati.

**Attenzione:** `JSON` rappresenta soltanto tipi compatibili (non serializza direttamente `datetime`, `set` o oggetti arbitrari).
Non usare `eval()` per parsare dati.
Per dati sensibili non scrivere token o password nei file degli esempi.
