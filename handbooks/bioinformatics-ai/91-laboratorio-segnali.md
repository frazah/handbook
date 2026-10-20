<!-- level: Laboratorio -->
<!-- summary: Segnalazioni aggregate simulate, tassi per popolazione e revisione di anomalie -->
# Laboratorio B — un segnale aggregato da verificare

**Obiettivo:** creare una semplice pipeline di controllo su conteggi aggregati **inventati**, senza dati personali e senza inferire eventi sanitari reali.

**File:** `lab/synthetic_signals.csv`, `lab/surveillance_demo.py`, `lab/test_labs.py`.

## Scenario

Ogni riga contiene `week`, `site`, `events`, `population` e `completeness` (frazione di report completi, tra 0 e 1).  
Il contenuto è fittizio; `events` non rappresenta casi di una malattia specifica.

1. **Valida** numeri non negativi, denominatore positivo, completezza 0–1.
2. Calcola il **tasso grezzo** per 10.000 residenti: `events / population * 10_000`.
3. Confronta il valore attuale con la **mediana delle tre settimane precedenti** (se complete).
4. Marca soltanto un `review_candidate`: richiede verifica, non costituisce un allarme.

```python
rate_per_10k = events / population * 10_000
# ATTENZIONE: soglie nell'esercizio sono arbitrarie e NON validate.
```

## Esecuzione

```bash
cd handbooks/bioinformatics-ai/lab
python surveillance_demo.py
python -m unittest discover -s . -p 'test_*.py'
```

## Cosa imparare dal risultato

- Un salto da 3 a 15 conteggi potrebbe meritare un **controllo dei dati**, ma non prova nulla da solo.
- Completezza bassa o cambiamento nella raccolta dei dati può rendere il segnale inaffidabile.
- Servirebbero stagionalità, definizioni, verifica umana, gestione dei falsi segnali e autorizzazioni per un sistema professionale.

**Sfide sicure:** introduci una riga duplicata e controlla che venga rifiutata; modifica `population` e valuta il tasso; spiega perché le soglie arbitrarie non vanno riusate nella realtà.
