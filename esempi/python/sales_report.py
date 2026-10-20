"""Esempio reale: aggrega vendite da CSV e salva report JSON; solo standard library."""
import csv
import json
from collections import defaultdict
from pathlib import Path

def summarize(path: Path) -> list[dict]:
    totals: dict[str, int] = defaultdict(int)
    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            if row["status"] == "paid":
                totals[row["customer"]] += int(row["total_cents"])
    return [{"customer": customer, "total_cents": amount}
            for customer, amount in sorted(totals.items())]

def main():
    base = Path(__file__).resolve().parent
    result = summarize(base / "sales.csv")
    (base / "report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(result)

if __name__ == "__main__":
    main()
