<!-- level: Laboratorio -->
<!-- summary: Leggi FASTA sintetici e calcola GC content e reverse complement -->
# Laboratorio A — sequenze biologiche sintetiche

**Obiettivo:** imparare a riconoscere FASTA e trattare una sequenza come dato, senza bisogno di dataset reali né strumenti di laboratorio.

**File inclusi:** `lab/demo_plants.fasta`, `lab/sequences.py`, `lab/test_labs.py`.  
Sono esempi **inventati** con identificatori di foglie fittizie.

## Cosa fa il codice

1. Legge file FASTA multiriga e costruisce un dizionario `{id: sequenza}`.
2. Valida alfabeto `A C G T N`: `N` = base non determinata.
3. Calcola **GC content** = (numero G + numero C) / (numero basi note A/C/G/T).
4. Calcola il **reverse complement**, una trasformazione standard di orientamento delle sequenze.

**Prima di leggere il codice — simboli e termini:**

- ***FASTA / FASTQ***: formati per sequenze biologiche; FASTQ aggiunge valori di qualità alle basi.

```python
from pathlib import Path
from sequences import parse_fasta, gc_fraction

records = parse_fasta(Path('demo_plants.fasta'))
for name, sequence in records.items():
    print(name, round(gc_fraction(sequence), 3))
```

## Esecuzione in VS Code

Apri la cartella `handbooks/bioinformatics-ai/lab/` nel terminale:

```bash
python sequences.py
python -m unittest discover -s . -p 'test_*.py'
```

**Domande:** perché `N` non è nel denominatore?  
Cosa succede se un record è vuoto?  
Perché due sequenze di lunghezza uguale non implicano funzioni uguali?

**Nota:** la percentuale G/C **non** identifica da sola specie, proprietà cliniche o funzione.
