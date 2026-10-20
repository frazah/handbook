#!/usr/bin/env python3
"""Rigenera il lettore offline dai file sorgenti, compresi nuovi .md nelle cartelle handbooks/."""
from pathlib import Path
import html
import json
import re
import sys

try:
    from markdown_it import MarkdownIt
    from pygments import highlight
    from pygments.formatters import HtmlFormatter
    from pygments.lexers import get_lexer_by_name
except ImportError:
    sys.exit('Dipendenze mancanti. Crea un venv e installa: python -m pip install markdown-it-py pygments')

ROOT = Path(__file__).resolve().parent
metadata = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
areas = json.loads((ROOT / 'areas.json').read_text(encoding='utf-8'))
area_ids = {area['id'] for area in areas}
if len(area_ids) != len(areas) or not all(area['id'] and area['name'] and area['description'] for area in areas):
    sys.exit('areas.json: categorie mancanti o duplicate')

# Ogni cartella con book.json è un handbook: non serve aggiornare un registro a mano.
import string
found = []
for folder in (ROOT / 'handbooks').iterdir():
    if not folder.is_dir() or not (folder / 'book.json').exists():
        continue
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', folder.name):
        sys.exit(f'Nome cartella non valido: {folder.name}')
    details = json.loads((folder / 'book.json').read_text(encoding='utf-8'))
    if details.get('id', folder.name) != folder.name:
        sys.exit(f'ID differente dal nome cartella in {folder}/book.json')
    for field in ('name', 'icon', 'desc', 'docs', 'color'):
        if not isinstance(details.get(field), str) or not details[field].strip():
            sys.exit(f'Campo {field} mancante in {folder}/book.json')
    if not re.fullmatch(r'#[a-fA-F0-9]{6}', details['color']):
        sys.exit(f'Colore non valido in {folder}/book.json')
    # Le categorie sono facoltative per la compatibilità con nuove cartelle importate.
    details.setdefault('area', 'other')
    if details['area'] not in area_ids and details['area'] != 'other':
        sys.exit(f'Area sconosciuta in {folder}/book.json: {details["area"]}')
    found.append((int(details.get('order', 500)), folder.name, details))
found.sort(key=lambda x: (x[0], x[1]))
books = {slug: {k: v for k, v in details.items() if k not in ('id', 'order')}
         for _, slug, details in found}
if not books:
    sys.exit('Nessun handbook trovato: aggiungi handbooks/<slug>/book.json')
metadata['books'] = books
if any(book['area'] == 'other' for book in books.values()):
    areas.append({'id': 'other', 'name': 'Altri argomenti', 'description': 'Nuove tecnologie in attesa di categorizzazione', 'icon': '⋯'})
existing = {chapter['path']: chapter for chapter in metadata['chapters']}
lexers = {'ts': 'typescript', 'tsx': 'tsx', 'js': 'javascript', 'jsx': 'jsx',
          'py': 'python', 'python': 'python', 'sh': 'bash', 'json': 'json'}
formatter = HtmlFormatter(nowrap=True, style='github-dark')
renderer = MarkdownIt('default', {'html': False, 'linkify': False}).enable('table')


def colored_code(code, language):
    name = lexers.get(language.lower(), language.lower())
    try:
        markup = highlight(code, get_lexer_by_name(name, stripnl=False), formatter)
    except Exception:
        markup = html.escape(code)
    return ('<div class="code-block"><div class="code-head">'
            '<span class="code-lang">' + html.escape(language) + '</span>'
            '<button class="copy-snippet" type="button">Copia ↗</button></div>'
            '<pre><code>' + markup + '</code></pre></div>')


def render_fence(tokens, idx, options, env):
    token = tokens[idx]
    language = (token.info.strip().split() or ['text'])[0]
    return colored_code(token.content, language) + '\n'


renderer.renderer.rules['fence'] = render_fence


def title_of(path, source):
    match = re.search(r'^#\s+(.+)$', source, flags=re.M)
    return match.group(1).strip() if match else path.stem.split('-', 1)[-1].replace('-', ' ').title()


def include(path):
    if path.name in {'utils.mjs', '00-LEGGIMI.md'}:
        return False
    if path.suffix == '.md':
        return path.parent.name != 'esempi-browser'
    if path.suffix in {'.js', '.mjs'}:
        return 'esercizi' not in path.parts and 'esempi-browser' not in path.parts
    return False


entries = []
for book in books:
    folder = ROOT / 'handbooks' / book
    for file in sorted(folder.rglob('*')):
        if not file.is_file() or not include(file.relative_to(folder)):
            continue
        relative = file.relative_to(ROOT).as_posix()
        source = file.read_text(encoding='utf-8')
        old = existing.get(relative, {})
        meta_level = re.search(r'<!--\s*level:\s*(.+?)\s*-->', source, flags=re.I)
        meta_summary = re.search(r'<!--\s*summary:\s*(.+?)\s*-->', source, flags=re.I)
        # Queste due righe sono metadati per indice e ricerca, NON testo della lezione.
        # MarkdownIt con html=False le mostrerebbe altrimenti letteralmente nel lettore.
        visible_source = re.sub(
            r'(?im)^[ \t]*<!--[ \t]*(?:level|summary)[ \t]*:[^\r\n]*?-->[ \t]*(?:\r?\n|$)',
            '', source
        ).lstrip('\r\n')
        level = meta_level.group(1).strip() if meta_level else old.get('level', 'Approfondimenti')
        summary = meta_summary.group(1).strip() if meta_summary else old.get('summary', 'Lezione aggiunta al tuo handbook')
        entry = {
            'book': book,
            'title': title_of(file, source) if meta_level or meta_summary else old.get('title', title_of(file, source)),
            'summary': summary,
            'level': level,
            'path': relative,
            'kind': 'md' if file.suffix == '.md' else 'js',
        }
        if entry['kind'] == 'md':
            rendered = renderer.render(visible_source)
            rendered = re.sub(r'<a href="(https?://[^\"]+)"',
                              r'<a target="_blank" rel="noopener noreferrer" href="\1"', rendered)
            entry['body'] = rendered
        else:
            entry['body'] = ('<div class="intro-note"><strong>File JavaScript originale.</strong> '
                             'I commenti spiegano teoria ed esempi.</div>'
                             + colored_code(source, 'javascript'))
        entry['search'] = re.sub(r'\s+', ' ', visible_source).strip()
        entries.append(entry)

# I recipe sono separati dagli handbook, così non gonfiano il conteggio dei corsi.
recipes = []
recipes_root = ROOT / 'recipes'
if recipes_root.exists():
    for folder in recipes_root.iterdir():
        if not folder.is_dir() or not (folder / 'recipe.json').exists():
            continue
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', folder.name):
            sys.exit(f'Nome cartella recipe non valido: {folder.name}')
        info = json.loads((folder / 'recipe.json').read_text(encoding='utf-8'))
        for field in ('title', 'description', 'difficulty'):
            if not isinstance(info.get(field), str) or not info[field].strip():
                sys.exit(f'{field} mancante in {folder}/recipe.json')
        for field in ('tags', 'related'):
            if not isinstance(info.get(field), list) or not all(isinstance(x, str) for x in info[field]):
                sys.exit(f'Campo {field} non valido in {folder}/recipe.json')
        if any(b not in books for b in info['related']):
            sys.exit(f'Una recipe fa riferimento a un handbook inesistente: {folder}/recipe.json')
        if info.get('id', folder.name) != folder.name:
            sys.exit(f'ID recipe non corrispondente alla cartella: {folder.name}')
        doc = folder / 'README.md'
        if not doc.is_file():
            sys.exit(f'Manca README.md in {folder}')
        source = doc.read_text(encoding='utf-8')
        rendered = renderer.render(source)
        rendered = re.sub(r'<a href="(https?://[^"]+)"',
                          r'<a target="_blank" rel="noopener noreferrer" href="\1"', rendered)
        recipes.append({
            'id': folder.name, 'title': info['title'], 'description': info['description'],
            'difficulty': info['difficulty'], 'tags': info['tags'], 'related': info['related'],
            'path': doc.relative_to(ROOT).as_posix(), 'order': int(info.get('order', 500)),
            'body': rendered, 'search': re.sub(r'\s+', ' ', source).strip()
        })
recipes.sort(key=lambda r: (r['order'], r['id']))
metadata['recipes'] = [{k: v for k, v in recipe.items() if k not in ('body', 'search')} for recipe in recipes]

order = list(books)
entries.sort(key=lambda x: (
    order.index(x['book']),
    0 if Path(x['path']).name.startswith('00-') else
    2 if Path(x['path']).name.startswith('99-') or Path(x['path']).name == 'ESERCIZI.md' else 1,
    x['path']
))

for entry in entries:
    # Metadata separato, editabile (title, summary, level); elimina solo rendering derivato
    existing[entry['path']] = {k: v for k, v in entry.items() if k not in ('body', 'search')}
metadata['chapters'] = [existing[x['path']] for x in entries]
(ROOT / 'manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')

def secure_json(obj):
    return json.dumps(obj, ensure_ascii=False).replace('<', '\\u003c')

script = (ROOT / 'tools' / 'app-template.js').read_text(encoding='utf-8')
script = (script.replace('__BOOKS__', secure_json(books))
         .replace('__LESSONS__', secure_json(entries))
         .replace('__AREAS__', secure_json(areas))
         .replace('__RECIPES__', secure_json(recipes)))
template = (ROOT / 'tools' / 'viewer-template.html').read_text(encoding='utf-8')
styles = (ROOT / 'tools' / 'stylesheet.css').read_text(encoding='utf-8')
page = template.replace('__CSS__', styles).replace('__JS__', script)
(ROOT / 'APRI-HANDBOOK.html').write_text(page, encoding='utf-8')
print(f'Hub aggiornato: {len(entries)} capitoli · {len(books)} tecnologie · {len(recipes)} recipes · APRI-HANDBOOK.html')
