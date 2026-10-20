from analyze_orders import load_valid_orders, summarize_paid


def test_only_valid_orders_are_loaded():
    df = load_valid_orders()
    assert (df["quantity"] > 0).all()
    assert (df["price"] >= 0).all()
    assert df["order_id"].is_unique
    assert len(df) == 23  # una riga con quantity=-1 viene esclusa


def test_only_paid_count_in_revenue():
    df = load_valid_orders()
    paid = df.loc[df["status"] == "paid"]
    summary = summarize_paid(df)
    assert summary["revenue"].sum() == (paid["quantity"] * paid["price"]).sum()
    assert set(summary["category"]) == {"Books", "Tech", "Home"}
