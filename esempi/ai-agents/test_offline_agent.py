import pytest
from offline_agent import Principal, handle_request, run_tool, ORDERS

USER = Principal(user_id="u-17")


def test_tool_reads_order():
    assert run_tool(USER, "lookup_order", {"order_id": "O-102"})["status"] == "spedito"


def test_unauthorized_order():
    with pytest.raises(PermissionError):
        run_tool(USER, "lookup_order", {"order_id": "O-103"})


def test_tool_allowlist():
    with pytest.raises(ValueError):
        run_tool(USER, "refund_order", {"order_id": "O-102"})


def test_unauthorized_args():
    with pytest.raises(ValueError):
        run_tool(USER, "lookup_order", {"order_id": "O-102", "owner": "u-17"})


def test_refund_is_only_proposed():
    before = ORDERS["O-102"].copy()
    assert "operatore" in handle_request(USER, "Rimborsami O-102")
    assert ORDERS["O-102"] == before


def test_malicious_note_does_not_control_routing():
    # La nota malevola non è passata come istruzione al router.
    assert "consegnato" in handle_request(USER, "Stato O-104?")
    assert "rimbors" not in handle_request(USER, "Stato O-104?").lower()
