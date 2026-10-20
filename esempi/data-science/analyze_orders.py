"""Analisi riproducibile delle vendite fittizie: python analyze_orders.py"""
from pathlib import Path
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # salva figura senza finestra interattiva
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent


def load_valid_orders(path: Path = HERE / "orders.csv") -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["date"])
    mandatory = {"order_id", "date", "category", "quantity", "price", "status"}
    if not mandatory.issubset(df.columns):
        raise ValueError(f"Colonne mancanti: {sorted(mandatory - set(df.columns))}")
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    # Elimina solo ordini con quantità/prezzo impossibili, registra poi gli esclusi.
    clean = df.loc[(df["quantity"] > 0) & (df["price"] >= 0)].copy()
    if clean["order_id"].duplicated().any():
        raise ValueError("ID ordine duplicato: verifica la sorgente dati")
    clean["amount"] = clean["quantity"] * clean["price"]
    return clean


def summarize_paid(df: pd.DataFrame) -> pd.DataFrame:
    paid = df.loc[df["status"] == "paid"].copy()
    return (paid.groupby("category", as_index=False)
                .agg(revenue=("amount", "sum"), orders=("order_id", "nunique"))
                .sort_values("revenue", ascending=False).reset_index(drop=True))


def make_report(folder: Path = HERE / "reports") -> pd.DataFrame:
    folder.mkdir(exist_ok=True)
    df = load_valid_orders()
    grouped = summarize_paid(df)
    grouped.to_csv(folder / "category-revenue.csv", index=False)
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.bar(grouped["category"], grouped["revenue"])
    ax.set(title="Fatturato ordini pagati per categoria", ylabel="Euro")
    ax.set_ylim(bottom=0)
    fig.tight_layout()
    fig.savefig(folder / "category-revenue.png", dpi=150)
    plt.close(fig)
    monthly = (df.loc[df["status"] == "paid"]
                 .set_index("date")["amount"].resample("MS").sum())
    monthly.to_csv(folder / "monthly-revenue.csv", header=["revenue"])
    print(grouped.to_string(index=False))
    print(f"\nReport salvato in: {folder}")
    return grouped


if __name__ == "__main__":
    make_report()
