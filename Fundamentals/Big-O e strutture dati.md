# Big-O e strutture dati

> Come stimare il costo di una soluzione e quale struttura dati scegliere. Serve in ogni esercizio di coding e in ogni colloquio tecnico.
> Collegate: [Pattern algoritmici](Pattern%20algoritmici.md) · [Python](../Languages/Python.md#per-gli-esercizi-di-coding) · [JavaScript](../Languages/JavaScript.md#per-gli-esercizi-di-coding)

## Modello mentale

- **Big-O** descrive come cresce il costo (tempo o memoria) al crescere dell'input `n`, ignorando costanti e termini minori: `3n² + 10n` → `O(n²)`.
- Si ragiona di solito sul **caso peggiore**; per le hash map si cita il **caso medio** (`O(1)`), sapendo che il peggiore è `O(n)`.
- **Ammortizzato:** un'operazione a volte costosa ma rara, spalmata su molte economiche. `append` su array dinamico è `O(1)` ammortizzato anche se ogni tanto rialloca e copia tutto.
- **Spazio:** conta la memoria *aggiuntiva* (strutture ausiliarie, stack della ricorsione), non l'input.
- Cicli annidati sullo stesso input → si moltiplicano (`O(n²)`); passi in sequenza → si sommano e domina il maggiore.
- Dimezzare il problema a ogni passo → `O(log n)`. Ordinare → `O(n log n)`.
- La struttura giusta trasforma una ricerca `O(n)` in `O(1)` (set/dict) o `O(log n)` (heap, BST, ricerca binaria): è l'ottimizzazione più frequente negli esercizi.

## Sintassi al volo

### Dai vincoli alla complessità attesa

Con circa 10⁸ operazioni semplici al secondo, i vincoli dell'esercizio suggeriscono la soluzione attesa:

| `n` fino a | Complessità accettabile | Tipicamente |
|---|---|---|
| 10–20 | `O(2ⁿ)`, `O(n!)` | backtracking, sottoinsiemi |
| 500 | `O(n³)` | DP su intervalli |
| 5 000 | `O(n²)` | doppio ciclo, DP 2D |
| 10⁵ – 10⁶ | `O(n log n)` | sort, heap, ricerca binaria |
| 10⁷+ | `O(n)`, `O(log n)` | una passata, two pointers, matematica |

### Costo delle operazioni

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

## Array e stringhe

Memoria contigua: accesso per indice `O(1)`, ma inserire o rimuovere in mezzo sposta tutti gli elementi successivi.

- In Python e JavaScript **le stringhe sono immutabili**: `s += c` in un ciclo crea ogni volta una nuova stringa, quindi `O(n²)` nel caso peggiore. Accumula in una lista e usa `"".join(parts)`.
- Lo slicing `a[i:j]` **copia** `j - i` elementi: dentro un ciclo diventa un costo nascosto.

## Hash map e set

Calcolano un hash della chiave per trovare il "bucket" in `O(1)` medio. Le collisioni degradano il caso peggiore a `O(n)`. Le chiavi devono essere **immutabili/hashable** (in Python: `tuple` sì, `list` no).

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

- **Stack (LIFO):** parentesi bilanciate, undo, DFS iterativa, monotonic stack.
- **Coda (FIFO):** BFS, elaborazione di job in ordine di arrivo.
- In Python `list.pop(0)` è `O(n)`: per le code usa `deque.popleft()`, che è `O(1)`.

```python
from collections import deque

pending = deque(["order-101", "order-102"])
pending.append("order-103")      # arriva un nuovo ordine
next_order = pending.popleft()   # O(1); con list.pop(0) sarebbe O(n)
assert next_order == "order-101"
```

## Heap (coda di priorità)

Albero binario completo salvato in un array: il minimo sta sempre in cima. Usalo quando ti serve ripetutamente "il più piccolo/grande" o i **top-k**.

```python
import heapq

sales = {"BOOK-1": 120, "MUG-2": 340, "PEN-3": 95, "BAG-4": 210}

# Top-k in O(n log k): heap di dimensione k, si scarta sempre il minimo.
top = heapq.nlargest(2, sales.items(), key=lambda item: item[1])
assert top == [("MUG-2", 340), ("BAG-4", 210)]
```

`heapq` è solo un min-heap: per un max-heap inserisci `-valore`.

## Alberi e BST

- **Albero binario:** ogni nodo ha al più due figli. Visite: *preorder* (nodo, sx, dx), *inorder* (sx, nodo, dx), *postorder* (sx, dx, nodo), *level order* (BFS).
- **BST:** sx < nodo < dx, quindi la visita inorder restituisce i valori ordinati. Le operazioni costano `O(h)`: `O(log n)` se bilanciato (AVL, red-black), `O(n)` se degenera in una lista.
- Altezza e ricorsione: la ricorsione su un albero usa `O(h)` di stack.

```python
from dataclasses import dataclass

@dataclass
class Node:
    value: int
    left: "Node | None" = None
    right: "Node | None" = None

def height(node: Node | None) -> int:
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

assert height(Node(5, Node(3, Node(1)), Node(8))) == 3
```

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

Anche una griglia è un grafo implicito: i vicini di `(r, c)` sono le 4 celle adiacenti. Gli algoritmi (BFS, DFS, Dijkstra, ordinamento topologico) sono in [Pattern algoritmici](Pattern%20algoritmici.md).

## Union-Find (Disjoint Set)

Mantiene gruppi disgiunti e risponde a "sono nello stesso gruppo?" in tempo quasi costante. Si usa per componenti connesse, cicli in grafi non diretti e algoritmo di Kruskal.

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

## Per gli esercizi di coding

Checklist per scegliere la struttura:

| Se ti serve… | Usa |
|---|---|
| "L'ho già visto?" / conteggi | `set` / `dict` / `Counter` |
| Elementi in ordine FIFO, BFS | `deque` |
| Annullare l'ultimo, parentesi, "prossimo maggiore" | stack (lista) |
| Ripetutamente il min/max, top-k | heap |
| Ricerca in dati ordinati | ricerca binaria (`bisect`) |
| Prefissi di stringhe | trie |
| Gruppi che si fondono | union-find |
| Relazioni tra entità | lista di adiacenza |

## Domande da colloquio

**Base**
- **Cosa significa O(n log n)?** Il costo cresce poco più che linearmente; è il costo tipico di un ordinamento per confronto ottimale (merge sort, heap sort).
- **Array vs linked list?** L'array ha accesso `O(1)` e una buona località di cache; la lista ha inserimenti `O(1)` dato il nodo, ma accesso `O(n)`. In pratica l'array vince quasi sempre.
- **Perché un dict ha lookup O(1)?** L'hash della chiave indica direttamente il bucket. È un caso medio: con molte collisioni degrada a `O(n)`.

**Intermedio**
- **Cos'è la complessità ammortizzata?** Il costo medio su una sequenza di operazioni. `append` raddoppia la capacità quando l'array è pieno, quindi le copie costano in totale `O(n)` su `n` inserimenti.
- **Quando un heap invece di ordinare?** Quando servono solo i top-k (`O(n log k)` contro `O(n log n)`) o quando gli elementi arrivano in streaming.
- **Lista di adiacenza o matrice?** Lista per grafi sparsi (memoria `O(V+E)`); matrice se il grafo è denso o servono controlli `O(1)` sugli archi.
- **Perché le chiavi di un dict devono essere immutabili?** Se una chiave cambiasse, cambierebbe il suo hash e non si ritroverebbe più nel bucket giusto.

**Avanzato**
- **Perché un BST può degradare?** Inserendo dati già ordinati diventa una catena di altezza `n`. Gli alberi auto-bilancianti (AVL, red-black) garantiscono un'altezza `O(log n)`.
- **Cosa rende Union-Find quasi O(1)?** Path compression e union by rank/size insieme danno `O(α(n))`, dove α è l'inversa di Ackermann (≤ 4 in pratica).
- **Spazio di una ricorsione?** `O(profondità)` per lo stack delle chiamate. In Python il limite di default è circa 1000 livelli.

## Approfondisci

- [Python — TimeComplexity (wiki)](https://wiki.python.org/moin/TimeComplexity)
- [Big-O Cheat Sheet](https://www.bigocheatsheet.com/)
- [Python `heapq`](https://docs.python.org/3/library/heapq.html) · [`collections`](https://docs.python.org/3/library/collections.html)
