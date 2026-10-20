#!/usr/bin/env python3
"""Crea una recipe minimalista. Uso: python tools/nuova_recipe.py slug "Titolo recipe"""
from pathlib import Path
import json
import re
import sys

if len(sys.argv) < 3 or not re.fullmatch(r'[a-z0-9][a-z0-9-]*', sys.argv[1]):
    sys.exit('Uso: python tools/nuova_recipe.py <slug-minuscolo> <Titolo della ricetta...>')
slug, title = sys.argv[1], ' '.join(sys.argv[2:])
root = Path(__file__).resolve().parent.parent
folder = root / 'recipes' / slug
if folder.exists():
    sys.exit(f'Esiste già: {folder}')
folder.mkdir(parents=True)
(folder / 'recipe.json').write_text(json.dumps({
    'id': slug, 'order': 500, 'title': title,
    'description': 'Risultato pratico e tecnologie coinvolte',
    'difficulty': 'Base', 'tags': [], 'related': []
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(folder / 'README.md').write_text(
    f'# {title}\n\n**Obiettivo:** ...\n\n## Prerequisiti\n\n## Passaggi\n\n'
    '```python\n# Esempio: sostituiscilo con codice reale verificato\n```\n\n'
    '## Errori comuni\n\n## Per approfondire\n', encoding='utf-8'
)
print(f'Creato {folder}: modifica i file e inserisci gli ID handbook in related, poi python AGGIORNA-HUB.py')
