#!/usr/bin/env python3
"""Crea una tecnologia installabile come cartella. Esempio: python tools/nuovo_handbook.py docker Docker"""
import json
import re
import sys
from pathlib import Path

if len(sys.argv) < 3 or not re.fullmatch(r'[a-z0-9][a-z0-9-]*', sys.argv[1]):
    sys.exit('Uso: python tools/nuovo_handbook.py <slug-minuscolo> <Nome visualizzato...>')
slug, name = sys.argv[1], ' '.join(sys.argv[2:])
root = Path(__file__).resolve().parent.parent
folder = root / 'handbooks' / slug
if folder.exists():
    sys.exit(f'Esiste già: {folder}')
folder.mkdir()
(folder / 'book.json').write_text(json.dumps({
    'id': slug, 'order': 500, 'name': name, 'icon': name[:2].upper(),
    'desc': f'Fondamenti e pratica di {name}', 'docs': '', 'color': '#91baff', 'area': 'other'
}, ensure_ascii=False, indent=2).replace('"docs": ""','"docs": "https://example.com/"')+'\n', encoding='utf-8')
(folder / '00-cheatsheet.md').write_text(f'<!-- level: Reference -->\n<!-- summary: Riferimento rapido -->\n# {name} — Cheatsheet\n\n- Concetti chiave\n', encoding='utf-8')
(folder / '01-introduzione.md').write_text(f'<!-- level: Basi -->\n<!-- summary: Le prime nozioni, esempi e casi d’uso -->\n# Introduzione a {name}\n\n## Quando usarlo\n\n## Esempio\n\n```python\nprint("Hello, world!")\n```\n', encoding='utf-8')
print(f'Creato {folder} — scegli area in book.json (vedi areas.json), modifica i .md e poi esegui python AGGIORNA-HUB.py')
