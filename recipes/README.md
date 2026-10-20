# Recipes — workflow tra più tecnologie

Una **recipe** affronta un compito pratico che combina più handbook. Le lezioni teoriche restano sotto `handbooks/`; le ricette richiamano quei concetti senza duplicarne tutta la spiegazione.

## Come aggiungere una recipe

Crea `recipes/<slug>/` con `recipe.json` e `README.md`. Al prossimo `python AGGIORNA-HUB.py` il lettore la trova automaticamente. Per partire da un modello usa `python tools/nuova_recipe.py <slug> "Titolo"`.

Esempio di metadati:

```json
{
  "id": "react-fastapi-tasks",
  "order": 10,
  "title": "React + FastAPI: lista task con API",
  "description": "Mini progetto e punti chiave.",
  "difficulty": "Intermedio",
  "tags": ["React", "FastAPI"],
  "related": ["react", "fastapi"]
}
```

Tieni ogni ricetta breve, completa, verificabile e possibilmente con un risultato atteso. I dati d'esempio non devono contenere credenziali o informazioni private.
