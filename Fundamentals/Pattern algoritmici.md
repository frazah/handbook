# Pattern algoritmici

> I template ricorrenti negli esercizi di coding e nei live coding. Riconosci il pattern, copia lo scheletro, adattalo.
> Collegate: [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md) · [Python per gli esercizi](../Languages/Python.md#per-gli-esercizi-di-coding)

## Modello mentale

- Quasi ogni esercizio è una variante di una ventina di pattern: il lavoro vero è **riconoscerlo** dai segnali del testo.
- Parti sempre dalla **forza bruta**, stimane il costo, poi chiediti quale lavoro ripetuto puoi evitare (memorizzarlo, ordinare prima, usare una struttura migliore).
- I vincoli su `n` ti dicono la complessità attesa ([tabella](Big-O%20e%20strutture%20dati.md#dai-vincoli-alla-complessità-attesa)).
- Ottimizzare quasi sempre significa scambiare memoria per tempo (hash map, memo, prefix sum).
- Gli edge case uccidono più dei bug logici: input vuoto, un solo elemento, duplicati, negativi, overflow (in JS), tutto uguale.

## Metodo in 6 passi (anche per il colloquio)

1. **Chiarisci:** input, output, vincoli, duplicati, ordinamento, valori negativi. Ripeti il problema a voce.
2. **Esempi:** uno normale e uno limite, calcolati a mano.
3. **Forza bruta:** dilla e dai la complessità, anche se non la scrivi.
4. **Ottimizza:** individua il pattern (tabella sotto) e spiega l'idea *prima* di scrivere codice.
5. **Scrivi** codice pulito con nomi chiari, ragionando ad alta voce.
6. **Testa** sugli esempi e sugli edge case, poi dichiara la complessità in tempo e spazio.

## Sintassi al volo: segnale → pattern

| Se il testo dice… | Pensa a |
|---|---|
| "coppia/tripla che somma a", "già visto", "frequenza" | [Hashing](#hashing-e-conteggi) |
| array **ordinato**, "coppia", palindromo, rimuovi in-place | [Two pointers](#two-pointers) |
| "sottoarray/sottostringa **contigua** più lunga/corta con…" | [Sliding window](#sliding-window) |
| "somma di un intervallo", "sottoarray con somma k" | [Prefix sum](#prefix-sum) |
| ordinato, "minimo valore tale che…", `n` enorme | [Ricerca binaria](#ricerca-binaria) |
| intervalli, prenotazioni, sovrapposizioni | [Intervalli](#intervalli) |
| "prossimo elemento maggiore/minore", parentesi | [Stack monotono](#stack-e-stack-monotono) |
| ciclo in lista, elemento a metà | [Fast/slow pointers](#fastslow-pointers) |
| albero: profondità, cammini, livelli | [DFS/BFS su alberi](#alberi-dfs-e-bfs) |
| griglia, "isole", cammino minimo senza pesi | [BFS/DFS su grafi](#grafi-bfs-e-dfs) |
| dipendenze, "ordine valido", prerequisiti | [Ordinamento topologico](#ordinamento-topologico) |
| cammino minimo con pesi positivi | [Dijkstra](#dijkstra) |
| "k più grandi/frequenti", merge di liste ordinate | [Heap](#heap-top-k) |
| "tutte le combinazioni/permutazioni/sottoinsiemi" | [Backtracking](#backtracking) |
| "numero di modi", "minimo costo", "massimo con scelte" | [Programmazione dinamica](#programmazione-dinamica) |
| gruppi che si uniscono, componenti connesse | [Union-Find](Big-O%20e%20strutture%20dati.md#union-find-disjoint-set) |

## Hashing e conteggi

Memorizza ciò che hai visto per rispondere in `O(1)`. Tempo `O(n)`, spazio `O(n)`.

```python
from collections import Counter

def first_unique_sku(skus: list[str]) -> str | None:
    counts = Counter(skus)  # passata 1: frequenze
    return next((s for s in skus if counts[s] == 1), None)  # passata 2: ordine originale

assert first_unique_sku(["MUG", "PEN", "MUG", "BAG"]) == "PEN"
```

## Two pointers

Due indici che si muovono verso il centro (array ordinato) o nella stessa direzione (lettura/scrittura in-place). `O(n)` tempo, `O(1)` spazio.

```python
def pair_sum_sorted(prices: list[int], target: int) -> tuple[int, int] | None:
    left, right = 0, len(prices) - 1
    while left < right:
        total = prices[left] + prices[right]
        if total == target:
            return left, right
        if total < target:
            left += 1   # serve una somma più grande
        else:
            right -= 1  # serve una somma più piccola
    return None

assert pair_sum_sorted([300, 500, 700, 1200], 1500) == (0, 3)
```

## Sliding window

Una finestra `[left, right]` che si allarga a destra e si restringe a sinistra quando viola il vincolo. `O(n)` perché ogni indice entra ed esce una volta sola.

```python
def longest_without_repeats(s: str) -> int:
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if last_seen.get(ch, -1) >= left:
            left = last_seen[ch] + 1  # salta oltre il duplicato
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best

assert longest_without_repeats("abcabcbb") == 3
```

**Finestra fissa** (es. "massimo di ordini in 3 giorni consecutivi"): aggiungi `a[right]`, togli `a[right - k]`.

## Prefix sum

`prefix[i]` = somma dei primi `i` elementi, quindi la somma di `a[i:j]` è `prefix[j] - prefix[i]` in `O(1)`. Combinato con una hash map conta i sottoarray con somma `k`.

```python
def count_subarrays_with_sum(daily_orders: list[int], k: int) -> int:
    seen = {0: 1}  # somma prefissa -> quante volte
    running = count = 0
    for n in daily_orders:
        running += n
        count += seen.get(running - k, 0)  # un prefisso precedente chiude un sottoarray = k
        seen[running] = seen.get(running, 0) + 1
    return count

assert count_subarrays_with_sum([1, 2, 3, -1, 1], 3) == 3
```

## Ricerca binaria

Dimezza lo spazio di ricerca: `O(log n)`. Il trucco più utile è la **ricerca sulla risposta**: se "x funziona" è monotono, cerca il più piccolo x che funziona.

```python
def first_true(lo: int, hi: int, ok) -> int:
    """Il più piccolo x in [lo, hi] con ok(x) True, assumendo ok monotona."""
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid      # mid va bene: cerca a sinistra, mid incluso
        else:
            lo = mid + 1
    return lo

# Capacità minima del furgone per consegnare i pacchi (in ordine) in `days` giorni.
def min_capacity(weights: list[int], days: int) -> int:
    def fits(cap: int) -> bool:
        used, load = 1, 0
        for w in weights:
            if load + w > cap:
                used, load = used + 1, 0
            load += w
        return used <= days
    return first_true(max(weights), sum(weights), fits)

assert min_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) == 15
```

Per gli array ordinati usa direttamente `bisect.bisect_left` / `bisect_right`.

## Intervalli

Ordina per inizio, poi confronta ogni intervallo con l'ultimo tenuto. `O(n log n)`.

```python
def merge_slots(slots: list[tuple[int, int]]) -> list[tuple[int, int]]:
    merged: list[tuple[int, int]] = []
    for start, end in sorted(slots):
        if merged and start <= merged[-1][1]:  # si sovrappone all'ultimo
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

assert merge_slots([(9, 11), (14, 16), (10, 12)]) == [(9, 12), (14, 16)]
```

**Greedy:** quando una scelta locale ottima è dimostrabilmente sicura (es. per il massimo numero di intervalli non sovrapposti, ordina per *fine* e prendi sempre il primo compatibile). Se non sai dimostrarlo, probabilmente serve la DP.

## Stack e stack monotono

Lo stack monotono tiene elementi in ordine crescente o decrescente e risolve "il prossimo maggiore" in `O(n)`.

```python
def days_until_higher_price(prices: list[int]) -> list[int]:
    result = [0] * len(prices)
    stack: list[int] = []  # indici con prezzo decrescente, in attesa di un maggiore
    for i, price in enumerate(prices):
        while stack and prices[stack[-1]] < price:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result

assert days_until_higher_price([73, 74, 75, 71, 69, 72, 76]) == [1, 1, 4, 2, 1, 1, 0]
```

## Fast/slow pointers

Uno avanza di 1, l'altro di 2: se c'è un ciclo si incontrano (Floyd). Quando il veloce arriva in fondo, il lento è a metà.

```python
from dataclasses import dataclass

@dataclass
class ListNode:
    val: int
    next: "ListNode | None" = None

def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

a, b = ListNode(1), ListNode(2)
a.next, b.next = b, a
assert has_cycle(a) and not has_cycle(ListNode(1))
```

## Alberi: DFS e BFS

DFS ricorsiva per proprietà che si combinano dai figli (altezza, somme, cammini); BFS con coda per lavorare **per livelli**.

```python
from collections import deque
from dataclasses import dataclass

@dataclass
class Node:
    val: int
    left: "Node | None" = None
    right: "Node | None" = None

def levels(root: Node | None) -> list[list[int]]:
    if not root:
        return []
    out, queue = [], deque([root])
    while queue:
        level = [queue.popleft() for _ in range(len(queue))]  # tutto il livello corrente
        out.append([n.val for n in level])
        queue.extend(c for n in level for c in (n.left, n.right) if c)
    return out

assert levels(Node(1, Node(2, Node(4)), Node(3))) == [[1], [2, 3], [4]]
```

## Grafi: BFS e DFS

BFS trova il **cammino minimo in archi** su grafi non pesati. Segna i nodi come visitati *quando li metti in coda*, non quando li estrai, altrimenti li accodi più volte.

```python
from collections import deque

def shortest_path_in_warehouse(grid: list[str]) -> int:
    """Passi da S a E evitando gli scaffali '#'. -1 se impossibile."""
    rows, cols = len(grid), len(grid[0])
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        (r, c), dist = queue.popleft()
        if grid[r][c] == "E":
            return dist
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append(((nr, nc), dist + 1))
    return -1

assert shortest_path_in_warehouse(["S.#", "..#", "#.E"]) == 4
```

DFS (ricorsiva o con stack) basta per connettività, "contare le isole", rilevare cicli.

## Ordinamento topologico

Ordina i nodi di un DAG rispettando le dipendenze (algoritmo di Kahn). Se non riesci a visitare tutti i nodi, c'è un ciclo.

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

## Dijkstra

Cammino minimo con pesi **non negativi**: un heap estrae sempre il nodo più vicino non ancora fissato. `O((V + E) log V)`.

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

Con pesi negativi serve Bellman-Ford; con pesi tutti uguali basta BFS.

## Heap: top-k

Heap di dimensione `k`: `O(n log k)`. Lo stesso approccio fa il merge di `k` liste ordinate (`heapq.merge`).

```python
import heapq
from collections import Counter

def top_k_products(sold_skus: list[str], k: int) -> list[str]:
    counts = Counter(sold_skus)
    return [sku for sku, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]

assert top_k_products(["MUG", "PEN", "MUG", "BAG", "MUG", "PEN"], 2) == ["MUG", "PEN"]
```

## Backtracking

Esplora l'albero delle scelte: **scegli → ricorri → annulla la scelta**. Esponenziale, quindi adatto a `n` piccoli. Pota i rami impossibili il prima possibile.

```python
def bundles_with_budget(prices: list[int], budget: int) -> list[list[int]]:
    """Tutte le combinazioni di prodotti (senza ripetizioni) che costano esattamente budget."""
    prices = sorted(prices)
    out: list[list[int]] = []

    def explore(start: int, remaining: int, chosen: list[int]) -> None:
        if remaining == 0:
            out.append(chosen.copy())  # copia: chosen verrà modificata
            return
        for i in range(start, len(prices)):
            if prices[i] > remaining:
                break  # potatura: la lista è ordinata
            chosen.append(prices[i])
            explore(i + 1, remaining - prices[i], chosen)
            chosen.pop()  # annulla la scelta

    explore(0, budget, [])
    return out

assert bundles_with_budget([5, 10, 15, 20], 25) == [[5, 20], [10, 15]]
```

Varianti: sottoinsiemi (prendi/non prendi), permutazioni (insieme dei già usati), combinazioni con ripetizione (`explore(i, …)` invece di `i + 1`).

## Programmazione dinamica

Serve quando il problema ha **sottoproblemi sovrapposti** e **sottostruttura ottima**. Procedura:

1. Definisci lo **stato**: cosa significa `dp[i]` (o `dp[i][j]`) in una frase.
2. Scrivi la **transizione**: come `dp[i]` dipende da stati più piccoli.
3. Fissa i **casi base** e l'ordine di calcolo.
4. **Memoization** (top-down: ricorsione + cache) è più facile da scrivere; **tabulazione** (bottom-up) evita i limiti di ricorsione e permette di ottimizzare lo spazio.

```python
from functools import cache

# 1D: numero minimo di monete per dare il resto (-1 se impossibile).
def min_coins(coins: list[int], amount: int) -> int:
    @cache
    def solve(rest: int) -> float:
        if rest == 0:
            return 0
        if rest < 0:
            return float("inf")
        return 1 + min(solve(rest - c) for c in coins)
    best = solve(amount)
    return -1 if best == float("inf") else int(best)

assert min_coins([1, 5, 10], 18) == 5 and min_coins([5], 3) == -1
```

```python
# 2D: zaino 0/1. dp[c] = valore massimo con capacità c (tabulazione con spazio O(capacità)).
def best_cart_value(items: list[tuple[int, int]], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for c in range(capacity, weight - 1, -1):  # all'indietro: ogni item usato una volta
            dp[c] = max(dp[c], dp[c - weight] + value)
    return dp[capacity]

assert best_cart_value([(1, 15), (3, 20), (4, 30)], 4) == 35
```

Classici da riconoscere: LIS, LCS / edit distance (`dp[i][j]` su due stringhe), coin change, knapsack, cammini in griglia, house robber.

## Bit manipulation essenziale

| Operazione | Codice |
|---|---|
| bit `i` acceso? | `x >> i & 1` |
| accendi il bit `i` | `x \| (1 << i)` |
| spegni il bit meno significativo | `x & (x - 1)` |
| potenza di due? | `x > 0 and x & (x - 1) == 0` |
| elemento che compare una volta sola (gli altri due volte) | XOR di tutti gli elementi |

## Domande da colloquio

**Base**
- **Come affronti un problema che non conosci?** Chiarisco vincoli ed esempi, propongo la forza bruta con la sua complessità, poi cerco il lavoro ripetuto da eliminare e il pattern corrispondente.
- **BFS o DFS?** BFS per il cammino minimo in archi e per lavorare per livelli; DFS per connettività, cicli e backtracking. Con la DFS ricorsiva attenzione alla profondità massima.
- **Quando la ricerca binaria?** Su dati ordinati, o su una risposta monotona ("con capacità x ce la faccio?").

**Intermedio**
- **Sliding window vs two pointers?** La sliding window è un caso di two pointers dove interessa il contenuto *tra* i puntatori (sottoarray contiguo). Non funziona se gli elementi negativi rompono la monotonia della somma: lì serve il prefix sum.
- **Memoization vs tabulazione?** Top-down è più naturale e calcola solo gli stati necessari; bottom-up evita lo stack di ricorsione e permette di ridurre lo spazio tenendo solo le righe necessarie.
- **Come capisci che il greedy è corretto?** Con un argomento di scambio: qualsiasi soluzione ottima può essere trasformata in quella greedy senza peggiorare. Se trovi un controesempio, passa alla DP.
- **Perché Dijkstra fallisce con pesi negativi?** Fissa un nodo quando lo estrae, assumendo che nessun cammino futuro possa abbassarne il costo: con archi negativi l'assunzione è falsa.

**Avanzato**
- **Come rilevi un ciclo in un grafo diretto?** Con l'ordinamento topologico (rimangono nodi non visitati) o con una DFS a tre colori (bianco, grigio, nero): trovare un nodo grigio indica un arco all'indietro.
- **Complessità del backtracking su sottoinsiemi?** `O(2ⁿ · n)`: 2ⁿ sottoinsiemi, ciascuno copiato in `O(n)`. Per le permutazioni è `O(n! · n)`.
- **Come riduci lo spazio di una DP 2D?** Se `dp[i]` dipende solo da `dp[i-1]`, tieni una sola riga, aggiornandola nell'ordine giusto (all'indietro nello zaino 0/1).

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — esercizi raggruppati per pattern
- [CP-Algorithms](https://cp-algorithms.com/) — algoritmi spiegati con rigore
- [Python `bisect`](https://docs.python.org/3/library/bisect.html) · [`heapq`](https://docs.python.org/3/library/heapq.html) · [`functools.cache`](https://docs.python.org/3/library/functools.html#functools.cache)
