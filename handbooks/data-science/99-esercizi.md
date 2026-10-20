<!-- level: Esercizi -->
<!-- summary: Pratica guidata sul dataset ordini e idee per estendere l'analisi -->
# Esercizi Data Science & Analysis

1. Carica `esempi/data-science/orders.csv` e verifica schema, null, duplicati e numero di record.
2. Calcola fatturato **solo** per gli ordini `paid`. Confronta `Books`, `Tech` e `Home`.
3. Calcola AOV per mese, considerando solo `order_id` distinti.
4. Trova i tre giorni con fatturato più alto e visualizzali.
5. Verifica cosa cambia eliminando i record con `quantity <= 0` (e perché non assumere che siano tutti errori).
6. Aggiungi al report un grafico salvato su file e una frase esplicativa.
7. *Extra ML:* crea una target binaria (`amount > soglia`) solo se ha senso per una domanda operativa; separa training e test, usa baseline e pipeline.

**Soluzione di partenza:** `esempi/data-science/analyze_orders.py`.  
Prova prima a risolverli da solo, poi confronta il risultato e aggiungi test.
