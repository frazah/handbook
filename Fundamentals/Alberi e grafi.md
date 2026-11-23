# Alberi e grafi

> Ricorsione su alberi, BST, trie e grafi (griglie comprese): i template per le categorie Trees, Tries, Graphs e Advanced Graphs della roadmap NeetCode.
> Collegate: [Pattern algoritmici](Pattern%20algoritmici.md) · [Backtracking e DP](Backtracking%20e%20DP.md) · [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md#alberi-e-bst) (rappresentazioni, trie, union-find)

## Modello mentale

- Un albero è ricorsivo: la risposta per un nodo si costruisce da quelle dei figli. Scrivi la funzione **fidandoti che funzioni sui figli** e pensa solo al caso base (`None`) e a come combinare i due risultati.
- L'informazione viaggia in due direzioni: **dal basso** (la funzione restituisce un valore: altezza, somma, "è bilanciato?") e **dall'alto** (passi un parametro: profondità, massimo sul percorso, limiti del BST). Molti problemi usano entrambe.
- Quando la risposta può non passare per la radice (diametro, cammino di somma massima), la funzione **restituisce** una cosa (il miglior ramo verso il basso) e **aggiorna una variabile esterna** con un'altra (il miglior cammino che "gira" nel nodo).
- Un grafo è un albero che può avere cicli: serve un insieme di **visitati**. Una griglia è un grafo implicito: i vicini di `(r, c)` sono le 4 celle adiacenti.
- Costi tipici: albero `O(n)` tempo e `O(h)` stack; grafo `O(V + E)`; griglia `O(righe · colonne)`. In Python la ricorsione si ferma a circa 1000 livelli: su griglie grandi usa uno stack esplicito.

## Sintassi al volo: segnale → tecnica

| Se il testo dice… | Tecnica |
|---|---|
| profondità, bilanciato, stesso albero, inverti | [DFS che restituisce un valore](#alberi-dfs) |
| diametro, cammino di somma massima | [DFS + variabile esterna](#alberi-dfs) |
| per livelli, "vista da destra", nodo più vicino alla radice | [BFS per livelli](#alberi-bfs-per-livelli) |
| BST: valida, k-esimo, antenato comune | [proprietà dell'ordinamento](#bst) |
| prefissi, ricerca con jolly, molte parole in una griglia | [Trie](#trie-negli-esercizi) |
| isole, regioni, componenti connesse | [DFS su griglia](#grafi-e-griglie) |
| "dopo quanti minuti tutto…", distanza dalla sorgente più vicina | [BFS multi-sorgente](#grafi-e-griglie) |
| prerequisiti, ordine valido, alfabeto sconosciuto | [Ordinamento topologico](#ordinamento-topologico) |
| archi aggiunti uno alla volta, "è un albero?", arco ridondante | [Union-Find](Big-O%20e%20strutture%20dati.md#union-find-disjoint-set) |
| cammino minimo con pesi | [Dijkstra](#cammini-minimi-con-pesi) |
| "al massimo k scali" | [Bellman-Ford limitato](#cammini-minimi-con-pesi) |
| collegare tutti i punti al costo minimo | [MST (Prim)](#albero-ricoprente-minimo) |

## Alberi: DFS

Due template in un esempio: `max_depth` restituisce un valore dal basso; `diameter` restituisce l'altezza ma intanto aggiorna il miglior cammino che passa per ogni nodo.

```python
from dataclasses import dataclass

@dataclass
class TreeNode:
    val: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def max_depth(node: TreeNode | None) -> int:
    if node is None:
        return 0  # caso base
    return 1 + max(max_depth(node.left), max_depth(node.right))

tree = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
assert max_depth(tree) == 3
```

```python
# continua dall'esempio precedente
def diameter(root: TreeNode | None) -> int:
    best = 0
    def height(node: TreeNode | None) -> int:
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)  # cammino che "gira" in node
        return 1 + max(left, right)     # al padre serve solo il ramo più lungo
    height(root)
    return best

assert diameter(tree) == 3  # 4 → 2 → 1 → 3
```

| Problema | Idea chiave |
|---|---|
| Invert Binary Tree | scambia `left` e `right`, poi ricorri sui figli |
| Balanced Binary Tree | l'altezza restituisce `-1` se un sottoalbero è sbilanciato: una passata sola, `O(n)` |
| Same Tree / Subtree of Another Tree | confronto ricorsivo nodo per nodo; per il sottoalbero prova `same_tree` da ogni nodo |
| Count Good Nodes | passa verso il basso il massimo visto sul percorso |
| Binary Tree Maximum Path Sum | come il diametro: restituisci `val + max(0, ramo migliore)`, aggiorna con `val + sx + dx` |
| Construct Tree from Preorder and Inorder | il primo del preorder è la radice; la sua posizione nell'inorder divide sinistra e destra (dict valore → indice) |
| Serialize and Deserialize | preorder con un marcatore per `None` (`"1,2,#,#,3,#,#"`); deserializza consumando un iteratore |

## Alberi: BFS per livelli

Una coda; a ogni giro del `while` elabori esattamente i nodi del livello corrente (`len(queue)` all'inizio del giro).

```python
# continua dall'esempio precedente
from collections import deque

def levels(root: TreeNode | None) -> list[list[int]]:
    if not root:
        return []
    out, queue = [], deque([root])
    while queue:
        level = [queue.popleft() for _ in range(len(queue))]  # tutto il livello corrente
        out.append([n.val for n in level])
        queue.extend(c for n in level for c in (n.left, n.right) if c)
    return out

assert levels(tree) == [[1], [2, 3], [4, 5]]
```

**Binary Tree Right Side View:** l'ultimo nodo di ogni livello.

## BST

In un BST ogni nodo ha **limiti ereditati da tutti gli antenati**, non solo dal padre: per questo si valida passando verso il basso l'intervallo ammesso.

```python
# continua dall'esempio precedente
def is_valid_bst(node: TreeNode | None, low: float = float("-inf"), high: float = float("inf")) -> bool:
    if node is None:
        return True
    if not low < node.val < high:
        return False
    return is_valid_bst(node.left, low, node.val) and is_valid_bst(node.right, node.val, high)

assert is_valid_bst(TreeNode(5, TreeNode(3), TreeNode(8)))
assert not is_valid_bst(TreeNode(5, TreeNode(3, None, TreeNode(6)), TreeNode(8)))  # 6 > 5 a sinistra
```

| Problema | Idea chiave |
|---|---|
| Kth Smallest Element in a BST | la visita inorder restituisce i valori in ordine: fermati al k-esimo |
| Lowest Common Ancestor of a BST | scendi dalla radice: entrambi minori → sinistra, entrambi maggiori → destra, altrimenti sei sull'antenato |
| Lowest Common Ancestor (albero qualsiasi) | DFS: il primo nodo che trova `p` in un sottoalbero e `q` nell'altro (o è uno dei due) è la risposta |

## Trie negli esercizi

La struttura è in [Big-O](Big-O%20e%20strutture%20dati.md#trie) (dict annidati, `"$"` per la fine parola). Negli esercizi si combina con la DFS.

```python
def build_trie(words: list[str]) -> dict:
    root: dict = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = word
    return root

def matches(node: dict, pattern: str) -> bool:
    """Ricerca con '.' come jolly (Design Add and Search Words)."""
    for i, ch in enumerate(pattern):
        if ch == ".":  # prova tutti i figli con il resto del pattern
            return any(matches(child, pattern[i + 1:]) for key, child in node.items() if key != "$")
        if ch not in node:
            return False
        node = node[ch]
    return "$" in node

trie = build_trie(["mug", "mud", "pen"])
assert matches(trie, "mu.") and matches(trie, "...") and not matches(trie, "m.")
```

**Word Search II** (trovare molte parole in una griglia): un trie di tutte le parole + DFS dalla griglia che avanza nel trie insieme alla cella. Ti fermi appena il prefisso non esiste nel trie; togli `"$"` quando trovi una parola, per non contarla due volte.

## Grafi e griglie

**DFS per contare le componenti** (isole): da ogni cella di terra non ancora visitata parte una visita che marca tutta l'isola.

```python
def count_islands(grid: list[str]) -> int:
    rows, cols = len(grid), len(grid[0])
    seen: set[tuple[int, int]] = set()
    islands = 0
    for r0 in range(rows):
        for c0 in range(cols):
            if grid[r0][c0] != "1" or (r0, c0) in seen:
                continue
            islands += 1
            stack = [(r0, c0)]  # DFS iterativa: niente limite di ricorsione
            seen.add((r0, c0))
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1" and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        stack.append((nr, nc))
    return islands

assert count_islands(["110", "010", "001"]) == 2
```

**BFS multi-sorgente:** metti in coda **tutte** le sorgenti all'inizio; ogni livello della BFS è un passo di tempo. Segna le celle quando le metti in coda, non quando le estrai, altrimenti finiscono in coda più volte.

```python
from collections import deque

def minutes_to_rot(grid: list[list[int]]) -> int:
    """Rotting Oranges: 2 = marcia, 1 = fresca, 0 = vuoto. -1 se qualcuna resta fresca."""
    rows, cols = len(grid), len(grid[0])
    queue = deque((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 2)
    fresh = sum(row.count(1) for row in grid)
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):  # un livello = un minuto
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # marca subito
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes

assert minutes_to_rot([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) == 4
```

Con una sola sorgente è la normale BFS per il cammino minimo in archi.

| Problema | Idea chiave |
|---|---|
| Max Area of Island | come le isole, ma conta le celle di ogni visita |
| Clone Graph | dict originale → copia; crea la copia **prima** di visitare i vicini, così i cicli si chiudono |
| Walls and Gates | BFS multi-sorgente partendo da tutte le porte |
| Pacific Atlantic Water Flow | al contrario: visita da ogni oceano "in salita"; la risposta è l'intersezione dei due insiemi |
| Surrounded Regions | marca le `O` collegate al bordo; tutte le altre diventano `X` |
| Word Ladder | BFS sulle parole; vicini tramite pattern con jolly (`h*t` → `hot`, `hit`) in un dict |
| Graph Valid Tree | esattamente `n − 1` archi **e** nessun ciclo (union-find) |
| Number of Connected Components | union-find, oppure una DFS da ogni nodo non visitato |
| Redundant Connection | union-find: il primo arco i cui estremi sono già nello stesso gruppo |

## Ordinamento topologico

Ordina i nodi di un grafo diretto rispettando le dipendenze (algoritmo di Kahn): parti dai nodi senza prerequisiti e "sblocca" i successivi. Se non riesci a visitare tutti i nodi, c'è un ciclo.

```python
from collections import deque

def build_order(deps: dict[str, list[str]]) -> list[str] | None:
    """deps[x] = elenco di ciò che deve venire prima di x."""
    indegree = {node: len(before) for node, before in deps.items()}
    unlocks: dict[str, list[str]] = {node: [] for node in deps}
    for node, before in deps.items():
        for b in before:
            unlocks[b].append(node)
    queue = deque(n for n, d in indegree.items() if d == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in unlocks[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == len(deps) else None  # None = ciclo

assert build_order({"db": [], "api": ["db"], "web": ["api"]}) == ["db", "api", "web"]
```

| Problema | Idea chiave |
|---|---|
| Course Schedule | si possono finire tutti i corsi se e solo se non c'è un ciclo: `build_order(...) is not None` |
| Course Schedule II | l'ordine stesso |
| Alien Dictionary | confronta parole adiacenti: la prima lettera diversa dà un arco; se una parola è prefisso della precedente ma più corta, l'input è invalido |

## Cammini minimi con pesi

**Dijkstra:** pesi **non negativi**; un heap estrae sempre il nodo più vicino non ancora fissato. `O((V + E) log V)`.

```python
import heapq

def cheapest_shipping(graph: dict[str, list[tuple[str, int]]], src: str) -> dict[str, int]:
    dist = {src: 0}
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue  # voce obsoleta: abbiamo già trovato di meglio
        for nxt, cost in graph.get(node, []):
            if d + cost < dist.get(nxt, float("inf")):
                dist[nxt] = d + cost
                heapq.heappush(heap, (d + cost, nxt))
    return dist

g = {"MIL": [("BOL", 5), ("TOR", 2)], "TOR": [("BOL", 1)], "BOL": [("ROM", 4)]}
assert cheapest_shipping(g, "MIL") == {"MIL": 0, "BOL": 3, "TOR": 2, "ROM": 7}
```

**Bellman-Ford limitato:** con un vincolo sul numero di archi ("al massimo `k` scali") Dijkstra non basta, perché il cammino più economico può usare troppi archi. Ogni giro di Bellman-Ford aggiunge al più un arco; con `k + 1` giri ottieni il migliore con al più `k + 1` voli. `O(k · E)`.

```python
def cheapest_with_stops(n: int, flights: list[tuple[int, int, int]], src: int, dst: int, k: int) -> int:
    cost = [float("inf")] * n
    cost[src] = 0
    for _ in range(k + 1):
        updated = cost.copy()  # legge solo i costi del giro precedente: un volo in più per giro
        for a, b, price in flights:
            if cost[a] + price < updated[b]:
                updated[b] = cost[a] + price
        cost = updated
    return -1 if cost[dst] == float("inf") else int(cost[dst])

flights = [(0, 1, 100), (1, 2, 100), (0, 2, 500)]
assert cheapest_with_stops(3, flights, 0, 2, k=1) == 200
assert cheapest_with_stops(3, flights, 0, 2, k=0) == 500
```

| Problema | Idea chiave |
|---|---|
| Network Delay Time | Dijkstra dal nodo `k`; risposta = la distanza massima (−1 se un nodo non è raggiunto) |
| Swim in Rising Water | Dijkstra in cui il costo di un cammino è il **massimo** sul percorso, non la somma |
| Cheapest Flights Within K Stops | Bellman-Ford limitato (sopra) |
| Reconstruct Itinerary | cammino euleriano (Hierholzer): DFS che usa ogni arco una volta e aggiunge il nodo quando resta senza archi; alla fine inverti |

## Albero ricoprente minimo

Collegare tutti i nodi con il costo totale minimo (MST). **Prim** fa crescere l'albero da un nodo, aggiungendo sempre l'arco più economico verso un nodo nuovo; è adatto ai grafi densi, come "tutti i punti collegabili fra loro". **Kruskal** ordina gli archi e li aggiunge se non creano un ciclo (union-find); è adatto quando hai già una lista di archi.

```python
import heapq

def min_cost_connect(points: list[tuple[int, int]]) -> int:
    """Min Cost to Connect All Points (distanza di Manhattan), algoritmo di Prim."""
    in_tree: set[int] = set()
    heap = [(0, 0)]  # (costo per collegarlo, indice del punto)
    total = 0
    while len(in_tree) < len(points):
        cost, i = heapq.heappop(heap)
        if i in in_tree:
            continue  # già collegato con un arco più economico
        in_tree.add(i)
        total += cost
        for j, (x, y) in enumerate(points):
            if j not in in_tree:
                heapq.heappush(heap, (abs(points[i][0] - x) + abs(points[i][1] - y), j))
    return total

assert min_cost_connect([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)]) == 20
```

## Domande da colloquio

**Base**
- **BFS o DFS?** BFS per il cammino minimo in archi e per lavorare per livelli; DFS per connettività, cicli e backtracking. Con la DFS ricorsiva attenzione alla profondità massima.
- **Preorder, inorder, postorder: quando servono?** Preorder per copiare o serializzare (prima il nodo); inorder su un BST per avere i valori ordinati; postorder quando il nodo dipende dai figli (altezza, cancellazione).

**Intermedio**
- **Perché validare un BST confrontando solo con il padre è sbagliato?** Un nodo deve rispettare i limiti di tutti gli antenati: un 6 nel sottoalbero sinistro di un 5 può essere maggiore del suo padre 3 e comunque violare il BST.
- **Perché nella BFS si marca il nodo quando entra in coda?** Altrimenti lo stesso nodo viene accodato da più vicini prima di essere estratto, moltiplicando il lavoro.
- **Perché Dijkstra fallisce con pesi negativi?** Fissa un nodo quando lo estrae, assumendo che nessun cammino futuro possa abbassarne il costo: con archi negativi l'assunzione è falsa. Serve Bellman-Ford.

**Avanzato**
- **Come rilevi un ciclo in un grafo diretto?** Con l'ordinamento topologico (rimangono nodi non visitati) o con una DFS a tre colori (bianco, grigio, nero): trovare un nodo grigio indica un arco all'indietro.
- **Prim o Kruskal?** Prim con heap per grafi densi o impliciti (tutti i punti collegabili); Kruskal con union-find quando gli archi sono pochi e già elencati. Entrambi `O(E log E)` circa.
- **Union-find o DFS per le componenti?** Con un grafo statico vanno bene entrambi; union-find è migliore quando gli archi arrivano uno alla volta e devi rispondere dopo ogni aggiunta.

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — Trees, Tries, Graphs, Advanced Graphs
- [CP-Algorithms — Grafi](https://cp-algorithms.com/graph/breadth-first-search.html)
- [VisuAlgo](https://visualgo.net/en) — animazioni di BFS, DFS, Dijkstra, MST
