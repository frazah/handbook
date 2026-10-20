"""Didattico: trova deviazioni in segnali aggregati INVENTATI.
NON genera allarmi sanitari, non diagnostica, non usa dati personali.
"""
import csv
from collections import defaultdict
from pathlib import Path
from statistics import median


def read_rows(path: str | Path) -> list[dict]:
    rows = []
    with Path(path).open(encoding="utf-8", newline="") as handle:
        for raw in csv.DictReader(handle):
            row = {
                "week": raw["week"],
                "site": raw["site"],
                "events": int(raw["events"]),
                "population": int(raw["population"]),
                "completeness": float(raw["completeness"]),
            }
            if (row["events"] < 0 or row["population"] <= 0
                    or not 0 <= row["completeness"] <= 1):
                raise ValueError(f"Valori incoerenti: {row}")
            row["rate_10k"] = row["events"] / row["population"] * 10_000
            rows.append(row)
    if len({(r['week'], r['site']) for r in rows}) != len(rows):
        raise ValueError("Righe duplicate per sito e settimana")
    return rows


def review_candidates(rows: list[dict], history_length=3, multiplier=2.0):
    """Euristica NON validata, solo per illustrare la logica del confronto."""
    by_site = defaultdict(list)
    for row in rows:
        by_site[row["site"]].append(row)

    result = []
    for site, series in by_site.items():
        series.sort(key=lambda row: row["week"])
        for i, row in enumerate(series):
            valid_history = [r["rate_10k"] for r in series[max(0, i - history_length):i]
                             if r["completeness"] >= 0.85]
            enough_context = len(valid_history) >= history_length
            baseline = median(valid_history) if enough_context else None
            candidate = bool(enough_context and row["completeness"] >= 0.85
                             and row["events"] >= 4 and baseline is not None
                             and row["rate_10k"] > baseline * multiplier)
            result.append({**row, "reference_rate_10k": baseline,
                           "review_candidate": candidate})
    return sorted(result, key=lambda r: (r["site"], r["week"]))


if __name__ == "__main__":
    input_file = Path(__file__).with_name("synthetic_signals.csv")
    for item in review_candidates(read_rows(input_file)):
        if item["review_candidate"]:
            print(f"Da verificare (solo demo): {item['site']} {item['week']} "
                  f"tasso={item['rate_10k']:.2f}/10k, "
                  f"baseline={item['reference_rate_10k']:.2f}/10k")
    print("ATTENZIONE: esempio sintetico; non è un sistema di sorveglianza sanitaria.")
