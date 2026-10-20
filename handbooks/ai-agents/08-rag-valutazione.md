<!-- level: Costruzione -->
<!-- summary: Precisione del retrieval, citazioni, freshness e access control -->
# Qualità del RAG e citazioni

Misura separatamente **retrieval** (hai recuperato i documenti giusti?) e **generation** (la risposta è fedele ai documenti?).  
Un modello fluente può costruire una risposta credibile usando chunk sbagliati.

## Piccolo test del retriever

## Prima del codice: cosa riconoscere

Valutare il RAG significa controllare separatamente recupero delle fonti e correttezza della risposta. Una citazione presente non garantisce che la risposta sia supportata.

```python
cases = [
    {"query": "quando ricevo il pacco?", "expected_doc": "shipping"},
    {"query": "come ricevo un rimborso?", "expected_doc": "refunds"},
]
# Valuta top-1 / recall@k con query annotate e documenti etichettati.
```

## Da verificare in produzione

1. **Permessi prima del retrieval**: l'utente vede solo i documenti autorizzati.
2. **Origine della prova**: salva `document_id`, versione, sezione e data.
3. **Freschezza**: riesegui indicizzazione quando cambia il documento.
4. **Robustezza**: prova query ambigue, documenti contraddittori e attacchi nei documenti.
5. **Astensione**: quando la fonte non basta, l'agente deve segnalarlo.

**Nota:** un link citato dal modello non garantisce che la frase sia realmente supportata; verifica la corrispondenza fra affermazione e passaggio citato.
