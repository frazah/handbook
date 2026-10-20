<!-- level: Costruzione -->
<!-- summary: Chunking, embeddings, retrieval e risposte basate su fonti -->
# RAG: interrogare documenti senza insegnarli al modello

**Retrieval-Augmented Generation**: prendi la domanda, recupera sezioni pertinenti di documenti e le passi all'LLM insieme alla richiesta.  
Utile per manuali aziendali, policy, documentazione e ricerca in PDF.

**Prima di leggere il codice — simboli e termini:**

- ***Embedding***: rappresentazione numerica del significato utile per la ricerca per similarità.

```text
Documenti → estrazione testo → chunk → embeddings → indice
Domanda → embedding → top-k chunk → prompt + fonti → risposta
```

## Retriever minimale, offline

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from collections import Counter

docs = {
    "refunds": "Il rimborso è possibile entro 14 giorni dall'acquisto.",
    "shipping": "La spedizione standard richiede 3-5 giorni lavorativi.",
}

def terms(s):
    return set(s.lower().replace("-", " ").split())

def retrieve(query):
    tokens = terms(query)
    return sorted(docs.items(), key=lambda kv: len(tokens & terms(kv[1])), reverse=True)

print(retrieve("Quali sono i giorni di spedizione?")[0])
```

È un semplice **retrieval lessicale**, non embeddings né RAG semantico completo; serve a capire il flusso prima di usare motori vettoriali.

## Errori frequenti

Chunk troppo lunghi, duplicati, metadata mancanti, documenti scaduti, autorizzazioni ignorate.  
Le risposte dovrebbero citare gli identificativi delle fonti recuperate e dichiarare quando le fonti non bastano.
