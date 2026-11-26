# Big-O e strutture dati

> Come stimare il costo di una soluzione, quale struttura dati scegliere e le tecniche essenziali per usarla negli esercizi (liste, heap, alberi, trie, grafi).  
> Serve in ogni esercizio di coding e in ogni colloquio tecnico.  
> Collegate: [Pattern algoritmici](Pattern%20algoritmici.md) (backtracking e DP compresi) · [Python](../Languages/Python.md#per-gli-esercizi-di-coding) · [JavaScript](../Languages/JavaScript.md#per-gli-esercizi-di-coding)

## Modello mentale

- **Big-O** descrive come cresce il costo (tempo o memoria) al crescere dell'input `n`, ignorando costanti e termini minori: `3n² + 10n` → `O(n²)`.
- **Spazio:** conta la memoria *aggiuntiva* (strutture ausiliarie, stack della ricorsione), non l'input.
- **Ammortizzato:** un'operazione a volte costosa ma rara, spalmata su molte economiche. `append` su array dinamico è `O(1)` ammortizzato anche se ogni tanto rialloca e copia tutto.
- Si ragiona di solito sul **caso peggiore**; per le hash map si cita il caso medio (`O(1)`), sapendo che il peggiore è `O(n)`.
- Dimezzare il problema a ogni passo → `O(log n)`. 
- Ordinare → `O(n log n)`.
- Cicli annidati sullo stesso input → si moltiplicano (`O(n²)`); passi in sequenza → si sommano e domina il maggiore.
- La struttura giusta trasforma una ricerca `O(n)` in `O(1)` (set/dict) oppure `O(log n)` (heap, BST, ricerca binaria): è l'ottimizzazione più frequente negli esercizi.

## Sintassi al volo

### Per gli esercizi di coding

Checklist per scegliere la struttura:

| Se ti serve… | Usa |
|---|---|
| "L'ho già visto?" / conteggi | `set` / `dict` / `Counter` |
| Elementi in ordine FIFO, BFS | `deque` |
| Annullare l'ultimo, parentesi, "prossimo maggiore" | stack (lista) |
| Ripetutamente il min/max, top-k | heap |
| Mediana di valori che arrivano in streaming | due heap |
| Inserire/togliere in mezzo dato il nodo, LRU | linked list (doppia) + hash map |
| Ricerca in dati ordinati | ricerca binaria (`bisect`) |
| Prefissi di stringhe | trie |
| Gruppi che si fondono | union-find |
| Relazioni tra entità | lista di adiacenza |

### Dai vincoli alla complessità attesa

Con circa 10⁸ operazioni semplici al secondo, i vincoli dell'esercizio suggeriscono la soluzione attesa:

| `n` fino a | Complessità accettabile | Tipicamente |
|---|---|---|
| 10⁷+ | `O(n)`, `O(log n)` | una passata, two pointers, matematica |
| 10⁵ – 10⁶ | `O(n log n)` | sort, heap, ricerca binaria |
| 5 000 | `O(n²)` | doppio ciclo, DP 2D |
| 10–20 | `O(2ⁿ)`, `O(n!)` | backtracking, sottoinsiemi |
| 500 | `O(n³)` | DP su intervalli |

### Costo delle operazioni

Accesso 1, Ricerca n, inserimento n, rimozione n

| Struttura | Accesso | Ricerca | Inserimento | Rimozione | Note |
|---|---|---|---|---|---|
| Array dinamico | `O(1)` | `O(n)` | `O(1)`* in coda, `O(n)` in testa | `O(1)` in coda, `O(n)` altrove | *ammortizzato |
| Hash map / set | — | `O(1)` medio | `O(1)` medio | `O(1)` medio | chiavi hashable |
| Linked list | `O(n)` | `O(n)` | `O(1)` dato il nodo | `O(1)` dato il nodo | |
| Stack / Deque | `O(1)` estremi | `O(n)` | `O(1)` | `O(1)` | |
| Heap binario | `O(1)` min | `O(n)` | `O(log n)` | `O(log n)` pop min | |
| BST bilanciato | — | `O(log n)` | `O(log n)` | `O(log n)` | ordinato |
| Trie | — | `O(L)` | `O(L)` | `O(L)` | `L` = lunghezza parola |
| Union-Find | — | `O(α(n))` ≈ `O(1)` | `O(α(n))` | — | con path compression |

### Equivalenti nei linguaggi

| Struttura | Python | JavaScript / TypeScript |
|---|---|---|
| Array dinamico | `list` | `Array` |
| Hash map / set | `dict`, `set`, `Counter` | `Map`, `Set` (meglio di `{}` per chiavi dinamiche) |
| Deque / coda | `collections.deque` | nessuna: array + indice di testa |
| Heap | `heapq` (min-heap) | nessuno: va scritto ([esempio](../Languages/JavaScript.md#per-gli-esercizi-di-coding)) |
| Ordinato | `bisect` su lista ordinata | nessuno nativo |

## Array

Memoria contigua: accesso per indice `O(1)`, ma inserire o rimuovere in mezzo sposta tutti gli elementi successivi.

## Stringhe

In Python e JavaScript **le stringhe sono immutabili**: `s += c` in un ciclo crea ogni volta una nuova stringa, quindi `O(n²)` nel caso peggiore.  Meglio accumulare in una lista e usare `"".join(parts)`.
Lo slicing `a[i:j]` **copia** `j - i` elementi: dentro un ciclo diventa un costo nascosto.

## Linked list

Nodi sparsi in memoria, collegati da puntatori (anche all'indietro, nella lista doppia).  
Inserire o togliere un nodo che hai già in mano costa `O(1)`, arrivarci costa `O(n)`, e la località di cache è scarsa.  
Negli esercizi ogni operazione è uno spostamento di puntatori: disegna i nodi e **salva `next` prima di sovrascriverlo**. Tre tecniche coprono quasi tutto:

- **Inversione:** tre riferimenti (precedente, corrente, successivo). `O(n)` tempo, `O(1)` spazio.
- **Lento e veloce:** uno avanza di 1, l'altro di 2. Quando il veloce arriva in fondo il lento è a metà; se c'è un ciclo si incontrano (Floyd).
- **Nodo dummy:** un nodo finto prima della testa elimina il caso speciale "la testa cambia"; il risultato è `dummy.next`.

```python
from dataclasses import dataclass

@dataclass
class ListNode:
    val: int
    next: "ListNode | None" = None

def reverse(head: ListNode | None) -> ListNode | None:
    prev = None
    while head:
        nxt = head.next   # salva il resto prima di staccarlo
        head.next = prev  # gira il puntatore
        prev, head = head, nxt
    return prev

def middle(head: ListNode) -> ListNode:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow

orders = ListNode(101, ListNode(102, ListNode(103)))
assert middle(orders).val == 102
rev = reverse(orders)
assert (rev.val, rev.next.val, rev.next.next.val) == (103, 102, 101)
```

```python
# continua dall'esempio precedente
def merge_sorted(a: ListNode | None, b: ListNode | None) -> ListNode | None:
    dummy = tail = ListNode(0)  # la testa del risultato non è un caso speciale
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b  # attacca ciò che resta
    return dummy.next

merged = merge_sorted(ListNode(9, ListNode(12)), ListNode(10))
assert (merged.val, merged.next.val, merged.next.next.val) == (9, 10, 12)
```

| Problema | Idea chiave |
|---|---|
| Linked List Cycle | lento e veloce: se `slow is fast` c'è un ciclo |
| Remove Nth Node From End | dummy + il veloce parte `n` passi avanti; quando arriva in fondo, il lento precede il nodo da togliere |
| Reorder List | metà (lento/veloce) → inverti la seconda metà → intreccia |
| Merge k Sorted Lists | heap di `(val, indice_lista, nodo)`: l'indice evita di confrontare due nodi |
| Copy List with Random Pointer | dict nodo originale → copia, poi collega `next` e `random` |
| LRU Cache | dict chiave → nodo + lista **doppia** in ordine d'uso; in Python `OrderedDict` |

## Hash map e set

Calcolano un hash della chiave per trovare il "bucket" in `O(1)` medio.  
Le collisioni degradano il caso peggiore a `O(n)`.  
Le chiavi devono essere **immutabili/hashable** (in Python: `tuple` sì, `list` no).

```python
# Prodotti ordinati insieme: per ogni ordine, trova la prima coppia che somma al budget.
def pair_within_budget(prices: list[int], budget_cents: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}  # prezzo -> indice; trasforma la ricerca O(n) in O(1)
    for i, price in enumerate(prices):
        if budget_cents - price in seen:
            return seen[budget_cents - price], i
        seen[price] = i
    return None

assert pair_within_budget([1299, 500, 2500, 700], 1999) == (0, 3)  # O(n) invece di O(n²)
```

## Stack, code e deque

**Stack (LIFO):** parentesi bilanciate, undo, DFS iterativa, monotonic stack.  
**Coda (FIFO):** BFS, elaborazione di job in ordine di arrivo.  
In Python `list.pop(0)` è `O(n)`: per le code usa `deque.popleft()`, che è `O(1)`.

```python
from collections import deque

pending = deque(["order-101", "order-102"])
pending.append("order-103")      # arriva un nuovo ordine
next_order = pending.popleft()   # O(1); con list.pop(0) sarebbe O(n)
assert next_order == "order-101"
```

## Heap (coda di priorità)

Albero binario completo salvato in un array: il minimo sta sempre in cima, ma il resto **non** è ordinato.  
Usalo quando ti serve *ripetutamente* "il più piccolo/grande": code di priorità, top-k, mediana in streaming.  
`heapq` è solo un min-heap: per un max-heap inserisci `-valore`; `heapify` trasforma una lista in heap in `O(n)`.

```python
import heapq

# Coda di priorità degli ordini: (priorità, id). Le tuple si confrontano elemento per elemento.
queue: list[tuple[int, int]] = []
heapq.heappush(queue, (2, 101))
heapq.heappush(queue, (1, 102))  # priorità più alta = numero più basso
heapq.heappush(queue, (2, 103))
assert heapq.heappop(queue) == (1, 102)
assert queue[0] == (2, 101)       # la cima si legge in O(1) senza estrarla
assert heapq.nlargest(2, [300, 1200, 800]) == [1200, 800]  # top-k: O(n log k)
```

**Due heap: mediana di uno stream.** Un max-heap tiene la metà inferiore, un min-heap quella superiore, bilanciate (al più un elemento di differenza): la mediana sta in cima. Inserimento `O(log n)`, lettura `O(1)`.

```python
import heapq

class RunningMedian:
    def __init__(self) -> None:
        self.low: list[int] = []   # max-heap (valori negati): metà inferiore
        self.high: list[int] = []  # min-heap: metà superiore

    def add(self, cents: int) -> None:
        heapq.heappush(self.low, -cents)
        heapq.heappush(self.high, -heapq.heappop(self.low))  # il max di low passa a high
        if len(self.high) > len(self.low):                    # low tiene l'elemento in più
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self) -> float:
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

stream = RunningMedian()
for cents in [1200, 300, 4500, 800]:
    stream.add(cents)
assert stream.median() == 1000  # (800 + 1200) / 2
```

| Problema | Idea chiave |
|---|---|
| Kth Largest Element in a Stream | min-heap di dimensione `k`: la cima è il k-esimo più grande |
| K Closest Points to Origin | heap su `x² + y²` (la radice non cambia l'ordine) |
| Last Stone Weight | max-heap con valori negati; estrai due, reinserisci la differenza |
| Kth Largest Element in an Array | heap di dimensione `k`, oppure quickselect: `O(n)` medio, `O(n²)` peggiore |

## Alberi e BST

**Albero binario:** ogni nodo ha al più due figli. Visite: *preorder* (nodo, sx, dx), *inorder* (sx, nodo, dx), *postorder* (sx, dx, nodo), *level order* (BFS).  
**BST:** sx < nodo < dx, quindi la visita inorder restituisce i valori ordinati.  
Le operazioni costano `O(h)`: `O(log n)` se bilanciato (AVL, red-black), `O(n)` se degenera in una lista. La ricorsione usa `O(h)` di stack.

Negli esercizi l'albero è ricorsivo: scrivi la funzione **fidandoti che funzioni sui figli** e pensa solo al caso base (`None`) e a come combinare i risultati. L'informazione sale con il valore restituito (altezza, somma) o scende con un parametro (profondità, limiti del BST). Se la risposta può non passare per la radice (diametro, cammino massimo), la funzione **restituisce** il ramo migliore e **aggiorna una variabile esterna** con il cammino che "gira" nel nodo.

```python
from dataclasses import dataclass

@dataclass
class TreeNode:
    val: int
    left: "TreeNode | None" = None
    right: "TreeNode | None" = None

def diameter(root: TreeNode | None) -> int:
    best = 0
    def height(node: TreeNode | None) -> int:
        nonlocal best
        if node is None:
            return 0                    # caso base
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)  # cammino che "gira" in node
        return 1 + max(left, right)     # al padre serve solo il ramo più lungo
    height(root)
    return best

tree = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
assert diameter(tree) == 3  # 4 → 2 → 1 → 3
```

**BFS per livelli:** a ogni giro elabori esattamente i nodi presenti in coda all'inizio del giro.

```python
# continua dall'esempio precedente
from collections import deque

def levels(root: TreeNode | None) -> list[list[int]]:
    out, queue = [], deque([root] if root else [])
    while queue:
        level = [queue.popleft() for _ in range(len(queue))]  # tutto il livello corrente
        out.append([n.val for n in level])
        queue.extend(c for n in level for c in (n.left, n.right) if c)
    return out

assert levels(tree) == [[1], [2, 3], [4, 5]]
```

**Validare un BST:** ogni nodo eredita i limiti da *tutti* gli antenati, non solo dal padre, quindi passi l'intervallo ammesso verso il basso.

```python
# continua dall'esempio precedente
def is_valid_bst(node: TreeNode | None, low: float = float("-inf"), high: float = float("inf")) -> bool:
    if node is None:
        return True
    if not low < node.val < high:
        return False
    return is_valid_bst(node.left, low, node.val) and is_valid_bst(node.right, node.val, high)

assert not is_valid_bst(TreeNode(5, TreeNode(3, None, TreeNode(6)), TreeNode(8)))  # 6 > 5 a sinistra
```

| Problema | Idea chiave |
|---|---|
| Invert Binary Tree | scambia `left` e `right`, poi ricorri sui figli |
| Balanced Binary Tree | l'altezza restituisce `-1` se un sottoalbero è sbilanciato: una passata, `O(n)` |
| Binary Tree Maximum Path Sum | come il diametro: restituisci `val + max(0, ramo migliore)`, aggiorna con `val + sx + dx` |
| Right Side View | BFS per livelli: l'ultimo nodo di ogni livello |
| Kth Smallest Element in a BST | visita inorder, fermati al k-esimo |
| Lowest Common Ancestor of a BST | entrambi minori → sinistra, entrambi maggiori → destra, altrimenti sei sull'antenato |
| Construct Tree from Preorder and Inorder | il primo del preorder è la radice; la sua posizione nell'inorder divide i sottoalberi |

## Trie

Albero di prefissi: ogni nodo è un carattere. È la struttura naturale per **autocompletamento** e ricerca per prefisso.

```python
def build_trie(words: list[str]) -> dict:
    root: dict = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = word  # marca la fine di una parola
    return root

def starts_with(trie: dict, prefix: str) -> list[str]:
    node = trie
    for ch in prefix:
        if ch not in node:
            return []
        node = node[ch]
    stack, found = [node], []
    while stack:  # raccoglie tutte le parole sotto il prefisso
        current = stack.pop()
        found += [v for k, v in current.items() if k == "$"]
        stack += [v for k, v in current.items() if k != "$"]
    return sorted(found)

trie = build_trie(["mug", "mouse", "monitor", "book"])
assert starts_with(trie, "mo") == ["monitor", "mouse"]
```

Negli esercizi: con il jolly `.` (Design Add and Search Words) provi tutti i figli con il resto del pattern; in **Word Search II** costruisci il trie delle parole e fai una DFS sulla griglia che avanza nel trie insieme alla cella, fermandoti appena il prefisso non esiste.

## Grafi

Nodi e archi, diretti o no, pesati o no. Due rappresentazioni:

| | Lista di adiacenza | Matrice di adiacenza |
|---|---|---|
| Memoria | `O(V + E)` | `O(V²)` |
| "u e v sono collegati?" | `O(grado)` | `O(1)` |
| Quando | grafi sparsi (quasi sempre) | grafi densi e piccoli |

```python
from collections import defaultdict

# Rotte di spedizione tra magazzini (grafo non diretto).
routes = [("MIL", "BOL"), ("BOL", "ROM"), ("MIL", "TOR")]
graph: defaultdict[str, list[str]] = defaultdict(list)
for a, b in routes:
    graph[a].append(b)
    graph[b].append(a)
assert graph["BOL"] == ["MIL", "ROM"]
```

Un grafo è un albero che può avere cicli: serve un insieme di **visitati**. Una griglia è un grafo implicito: i vicini di `(r, c)` sono le 4 celle adiacenti. Costo `O(V + E)` (griglia: `O(righe · colonne)`).

### BFS e DFS su griglia

**DFS** per connettività e componenti (isole): da ogni cella non visitata parte una visita che marca tutta la componente. Usa uno stack esplicito: in Python la ricorsione si ferma a circa 1000 livelli.

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
            stack = [(r0, c0)]
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

**BFS** per il cammino minimo in numero di archi. Con più sorgenti (multi-sorgente) le metti **tutte** in coda all'inizio: ogni livello è un passo di tempo. Marca le celle quando entrano in coda, non quando escono, altrimenti vengono accodate più volte.

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

| Problema | Idea chiave |
|---|---|
| Clone Graph | dict originale → copia; crea la copia **prima** di visitare i vicini, così i cicli si chiudono |
| Pacific Atlantic Water Flow | al contrario: visita da ogni oceano "in salita", poi interseca i due insiemi |
| Surrounded Regions | marca le `O` collegate al bordo; tutte le altre diventano `X` |
| Word Ladder | BFS sulle parole; vicini tramite pattern con jolly (`h*t`) in un dict |
| Graph Valid Tree / Redundant Connection | [union-find](#union-find-disjoint-set): un arco tra nodi già nello stesso gruppo chiude un ciclo |

### Ordinamento topologico

Ordina i nodi di un grafo diretto rispettando le dipendenze (algoritmo di Kahn): parti dai nodi senza prerequisiti e "sblocca" i successivi. Se non visiti tutti i nodi, c'è un ciclo. Serve per prerequisiti, ordine di build, Course Schedule I e II, Alien Dictionary.

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

### Cammini minimi e MST

**Dijkstra:** cammino minimo con pesi **non negativi**; un heap estrae sempre il nodo più vicino non ancora fissato. `O((V + E) log V)`.

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

| Caso | Algoritmo |
|---|---|
| pesi negativi, o "al massimo `k` scali" | **Bellman-Ford**: `k + 1` giri su tutti gli archi, leggendo i costi del giro precedente. `O(k · E)` |
| collegare tutti i nodi al costo minimo (MST) | **Prim**: come Dijkstra, ma la priorità è il costo dell'arco, non la distanza. **Kruskal**: archi ordinati + union-find |
| Network Delay Time | Dijkstra; risposta = la distanza massima (−1 se un nodo non è raggiunto) |
| Swim in Rising Water | Dijkstra in cui il costo di un cammino è il **massimo** sul percorso |

## Union-Find (Disjoint Set)

Mantiene gruppi disgiunti e risponde a "sono nello stesso gruppo?" in tempo quasi costante.   
Si usa per componenti connesse, cicli in grafi non diretti e algoritmo di Kruskal.

```python
class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path compression
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        self.parent[ra] = rb
        return ra != rb  # False: erano già collegati (ciclo)

uf = UnionFind(4)
uf.union(0, 1); uf.union(2, 3)
assert uf.find(0) == uf.find(1) and uf.find(1) != uf.find(2)
```

## Domande da colloquio

**Base**
- **Cosa significa O(n log n)?** Il costo cresce poco più che linearmente; è il costo tipico di un ordinamento per confronto ottimale (merge sort, heap sort).
- **Array vs linked list?** L'array ha accesso `O(1)` e una buona località di cache; la lista ha inserimenti `O(1)` dato il nodo, ma accesso `O(n)`. In pratica l'array vince quasi sempre.
- **Perché un dict ha lookup O(1)?** L'hash della chiave indica direttamente il bucket. È un caso medio: con molte collisioni degrada a `O(n)`.

**Intermedio**
- **Cos'è la complessità ammortizzata?** Il costo medio su una sequenza di operazioni. `append` raddoppia la capacità quando l'array è pieno, quindi le copie costano in totale `O(n)` su `n` inserimenti.
- **Quando un heap invece di ordinare?** Quando servono solo i top-k (`O(n log k)` contro `O(n log n)`) o quando gli elementi arrivano in streaming.
- **Come implementi una cache LRU con `get` e `put` in `O(1)`?** Hash map dalla chiave al nodo di una lista doppiamente collegata ordinata per uso: a ogni accesso sposti il nodo in testa, quando sei pieno togli la coda. La lista doppia serve perché staccare un nodo richiede il precedente.
- **BFS o DFS?** BFS per il cammino minimo in archi e per lavorare per livelli; DFS per connettività e cicli. Nella BFS marca il nodo quando entra in coda, non quando esce.
- **Perché validare un BST confrontando solo con il padre è sbagliato?** Un nodo deve rispettare i limiti di tutti gli antenati: un 6 sotto il 3 nel sottoalbero sinistro di un 5 è maggiore del padre ma viola il BST.
- **Lista di adiacenza o matrice?** Lista per grafi sparsi (memoria `O(V+E)`); matrice se il grafo è denso o servono controlli `O(1)` sugli archi.
- **Perché le chiavi di un dict devono essere immutabili?** Se una chiave cambiasse, cambierebbe il suo hash e non si ritroverebbe più nel bucket giusto.

**Avanzato**
- **Perché un BST può degradare?** Inserendo dati già ordinati diventa una catena di altezza `n`. Gli alberi auto-bilancianti (AVL, red-black) garantiscono un'altezza `O(log n)`.
- **Perché la mediana con due heap e non una lista ordinata?** Inserire in una lista ordinata costa `O(n)` per lo spostamento; con due heap l'inserimento è `O(log n)` e la mediana resta in cima.
- **Perché Dijkstra fallisce con pesi negativi?** Fissa un nodo quando lo estrae, assumendo che nessun cammino futuro lo migliori: con archi negativi è falso. Serve Bellman-Ford.
- **Cosa rende Union-Find quasi O(1)?** Path compression e union by rank/size insieme danno `O(α(n))`, dove α è l'inversa di Ackermann (≤ 4 in pratica).
- **Spazio di una ricorsione?** `O(profondità)` per lo stack delle chiamate. In Python il limite di default è circa 1000 livelli.

## Approfondisci

- [Python — TimeComplexity (wiki)](https://wiki.python.org/moin/TimeComplexity)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
- [Python `heapq`](https://docs.python.org/3/library/heapq.html) · [`collections`](https://docs.python.org/3/library/collections.html)
- [VisuAlgo](https://visualgo.net/en) — animazioni di liste, heap, BST, BFS, DFS, Dijkstra, MST
- [NeetCode Roadmap](https://neetcode.io/roadmap) — Linked List, Trees, Tries, Heap, Graphs, Advanced Graphs
