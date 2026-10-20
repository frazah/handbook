"""Opzionale: agente LLM reale. Richiede openai-agents e OPENAI_API_KEY.

Uso: python sdk_order_agent.py
Non usiamo azioni di scrittura. Evita chiavi API nel repository.
"""
import os


def main():
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("Configura OPENAI_API_KEY nell'ambiente, non nel codice")
    from agents import Agent, Runner
    from agents.decorators import tool

    @tool
    def lookup_demo_order(order_id: str) -> str:
        """Look up the status for a fictional test order."""
        return {"O-102": "spedito", "O-103": "in preparazione"}.get(order_id, "non trovato")

    agent = Agent(
        name="Supporto ordini demo",
        instructions="Consulta il tool sugli ordini demo, non inventare stati. "
                     "Non puoi concedere rimborsi né cambiare dati.",
        tools=[lookup_demo_order],
    )
    print(Runner.run_sync(agent, "Qual è lo stato dell'ordine O-102?").final_output)


if __name__ == "__main__":
    main()
