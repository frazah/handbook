# Laboratorio AI Agents — supporto ordini

## 1. Offline (gratuito, zero API)

```bash
python offline_agent.py
python -m pip install pytest
python -m pytest -q
```

Scopri: validazione di tool e argomenti, autorizzazione per singolo ordine, prevenzione degli effetti collaterali, prompt injection trattata come dato. **È un router deterministico, non un LLM**.

## 2. Online (facoltativo, API potenzialmente a pagamento)

```bash
python -m pip install -r requirements-optional.txt
# Imposta OPENAI_API_KEY come variabile d'ambiente, fuori da Git.
python sdk_order_agent.py
```

Il tool `lookup_demo_order` legge solo dati inventati. Non usare credenziali vere né dati reali nel laboratorio. Se l'API dell'SDK cambia, verifica la [guida ufficiale](https://openai.github.io/openai-agents-python/quickstart/).
