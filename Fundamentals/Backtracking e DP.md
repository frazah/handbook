# Backtracking e DP

> Due modi di esplorare tutte le scelte possibili: il **backtracking** le elenca, la **programmazione dinamica** le conta o le ottimizza senza ripetere il lavoro. Copre le categorie Backtracking, 1-D DP e 2-D DP della roadmap NeetCode.
> Collegate: [Pattern algoritmici](Pattern%20algoritmici.md) · [Alberi e grafi](Alberi%20e%20grafi.md) · [Python per gli esercizi](../Languages/Python.md#per-gli-esercizi-di-coding)

## Modello mentale

- Entrambi partono dallo stesso **albero delle decisioni**: a ogni passo scegli (prendo o non prendo, quale elemento, quale direzione).
- **Backtracking** quando servono *tutte* le soluzioni: il costo è esponenziale, ma inevitabile se l'output stesso è esponenziale. Si riduce **potando** i rami che non possono portare a una soluzione.
- **DP** quando serve *un numero* (quanti modi, costo minimo, valore massimo) e gli stessi sottoproblemi si ripetono. Ogni stato si calcola una volta: costo = numero di stati × costo di una transizione.
- Il passaggio pratico dall'uno all'altro: scrivi la ricorsione a forza bruta, individua gli **argomenti che cambiano** (sono lo stato), aggiungi `@cache`. Se serve, converti in tabella.
- Test per lo stato: "la risposta da qui in poi dipende da *come* ci sono arrivato?". Se sì, nello stato manca qualcosa.

## Backtracking

Esplora l'albero delle scelte: **scegli → ricorri → annulla la scelta**. Esponenziale, quindi adatto a `n` piccoli (≤ 20 circa).

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
            if i > start and prices[i] == prices[i - 1]:
                continue  # stesso valore allo stesso livello: eviti combinazioni doppie
            chosen.append(prices[i])
            explore(i + 1, remaining - prices[i], chosen)
            chosen.pop()  # annulla la scelta

    explore(0, budget, [])
    return out

assert bundles_with_budget([5, 10, 15, 20], 25) == [[5, 20], [10, 15]]
assert bundles_with_budget([10, 5, 10, 15], 25) == [[5, 10, 10], [10, 15]]  # [10, 15] una volta sola
```

Gli altri due scheletri: **sottoinsiemi** (per ogni elemento: prendo / non prendo) e **permutazioni** (a ogni livello qualsiasi elemento non ancora usato).

```python
def subsets(items: list[str]) -> list[list[str]]:
    out: list[list[str]] = []
    def explore(i: int, chosen: list[str]) -> None:
        if i == len(items):
            out.append(chosen.copy())
            return
        chosen.append(items[i])  # prendo items[i]
        explore(i + 1, chosen)
        chosen.pop()             # non lo prendo
        explore(i + 1, chosen)
    explore(0, [])
    return out

assert len(subsets(["MUG", "PEN", "BAG"])) == 8  # 2³
```

```python
def permutations(items: list[str]) -> list[list[str]]:
    out: list[list[str]] = []
    def explore(chosen: list[str], remaining: list[str]) -> None:
        if not remaining:
            out.append(chosen.copy())
            return
        for i, item in enumerate(remaining):
            chosen.append(item)
            explore(chosen, remaining[:i] + remaining[i + 1:])
            chosen.pop()
    explore([], items)
    return out

assert len(permutations(["MUG", "PEN", "BAG"])) == 6  # 3!
```

**Su griglia** la scelta è la direzione, e "annullare" significa liberare la cella per gli altri percorsi.

```python
def word_exists(board: list[str], word: str) -> bool:
    rows, cols = len(board), len(board[0])
    path: set[tuple[int, int]] = set()  # celle usate dal percorso corrente
    def explore(r: int, c: int, i: int) -> bool:
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or (r, c) in path or board[r][c] != word[i]:
            return False
        path.add((r, c))
        found = any(explore(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        path.remove((r, c))  # annulla la scelta
        return found
    return any(explore(r, c, 0) for r in range(rows) for c in range(cols))

board = ["ABCE", "SFCS", "ADEE"]
assert word_exists(board, "ABCCED") and not word_exists(board, "ABCB")
```

| Problema | Idea chiave |
|---|---|
| Subsets / Permutations | scheletri sopra |
| Combination Sum | come `bundles_with_budget`, ma ricorri con `i` invece di `i + 1`: lo stesso elemento si può riusare |
| Subsets II / Combination Sum II | ordina e salta `items[i] == items[i − 1]` quando `i > start` (come sopra) |
| Word Search | backtracking su griglia (sopra) |
| Palindrome Partitioning | scegli dove finisce il prossimo pezzo; prosegui solo se il pezzo è palindromo |
| Letter Combinations of a Phone Number | un livello per cifra, un ramo per lettera |
| Generate Parentheses | aggiungi `(` se `aperte < n`, `)` se `chiuse < aperte` |
| N-Queens | una regina per riga; set delle colonne, delle diagonali `r − c` e delle antidiagonali `r + c` occupate |

## Programmazione dinamica

Serve quando il problema ha **sottoproblemi sovrapposti** e **sottostruttura ottima**. Procedura:

1. Definisci lo **stato**: cosa significa `dp[i]` (o `dp[i][j]`) in una frase.
2. Scrivi la **transizione**: come `dp[i]` dipende da stati più piccoli.
3. Fissa i **casi base** e l'ordine di calcolo.
4. **Memoization** (top-down: ricorsione + cache) è più facile da scrivere; **tabulazione** (bottom-up) evita i limiti di ricorsione e permette di ottimizzare lo spazio.

Lo stesso problema nelle due forme. **House Robber:** massimo valore senza prendere due elementi adiacenti.

```python
from functools import cache

def max_loot(values: list[int]) -> int:
    @cache
    def best(i: int) -> int:  # stato: il meglio ottenibile dall'indice i in poi
        if i >= len(values):
            return 0
        return max(values[i] + best(i + 2), best(i + 1))  # prendo i (e salto i+1) o lo salto
    return best(0)

def max_loot_table(values: list[int]) -> int:
    take = skip = 0  # tabulazione: bastano gli ultimi due stati, spazio O(1)
    for value in values:
        take, skip = skip + value, max(take, skip)
    return max(take, skip)

assert max_loot([2, 7, 9, 3, 1]) == max_loot_table([2, 7, 9, 3, 1]) == 12
```

### DP 1D

```python
from functools import cache

# Numero minimo di monete per dare il resto (-1 se impossibile).
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

**Kadane** (sottoarray contiguo di somma massima): lo stato è "la somma migliore che *finisce* nel giorno `i`". Conviene estendere la serie precedente solo se è positiva, altrimenti si ricomincia. Serve solo il valore precedente, quindi lo spazio è `O(1)`.

```python
def best_streak(daily_profit: list[int]) -> int:
    best = current = daily_profit[0]
    for profit in daily_profit[1:]:
        current = max(profit, current + profit)  # ricomincia da qui o estendi la serie
        best = max(best, current)
    return best

assert best_streak([-2, 1, -3, 4, -1, 2, 1, -5, 4]) == 6  # giorni [4, -1, 2, 1]
```

**Sottosequenza crescente più lunga (LIS) in `O(n log n)`:** `tails[k]` è la coda più piccola possibile di una sottosequenza crescente lunga `k + 1`. Ogni valore estende la più lunga o abbassa una coda.

```python
from bisect import bisect_left

def lis_length(prices: list[int]) -> int:
    tails: list[int] = []
    for price in prices:
        i = bisect_left(tails, price)
        if i == len(tails):
            tails.append(price)  # estende la sottosequenza più lunga
        else:
            tails[i] = price     # coda più bassa: lascia più spazio ai valori futuri
    return len(tails)

assert lis_length([10, 9, 2, 5, 3, 7, 101, 18]) == 4  # es. 2, 3, 7, 18
```

| Problema | Stato e transizione |
|---|---|
| Climbing Stairs | `dp[i] = dp[i−1] + dp[i−2]` (Fibonacci) |
| Min Cost Climbing Stairs | `dp[i] = cost[i] + min(dp[i−1], dp[i−2])` |
| House Robber II | case in cerchio: risolvi senza la prima e senza l'ultima, prendi il massimo |
| Longest Palindromic Substring / Palindromic Substrings | espandi attorno a ogni centro (`2n − 1` centri, uno per carattere e uno tra due caratteri): `O(n²)` tempo, `O(1)` spazio |
| Decode Ways | `dp[i] = dp[i−1]` (se la cifra non è 0) `+ dp[i−2]` (se le ultime due cifre sono tra 10 e 26) |
| Maximum Product Subarray | come Kadane, ma tieni il massimo **e il minimo** che finiscono in `i`: un negativo li scambia |
| Word Break | `dp[i]` = il prefisso lungo `i` si può comporre: vero se esiste `j` con `dp[j]` e `s[j:i]` nel dizionario |
| Partition Equal Subset Sum | zaino booleano: si raggiunge esattamente `sum / 2`? Basta un set delle somme raggiungibili |

### DP 2D

Lo stato ha due indici: due stringhe (`i` caratteri di una, `j` dell'altra), una griglia, oppure indice + capacità.

```python
def lcs(a: str, b: str) -> int:
    """Longest Common Subsequence. dp[i][j] = LCS di a[:i] e b[:j]."""
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]  # riga e colonna 0: stringa vuota
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # carattere in comune: diagonale + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # scarta un carattere da a o da b
    return dp[-1][-1]

assert lcs("abcde", "ace") == 3
```

**Zaino 0/1** con la tabella ridotta a una riga: `dp[c]` = valore massimo con capacità `c`.

```python
def best_cart_value(items: list[tuple[int, int]], capacity: int) -> int:
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for c in range(capacity, weight - 1, -1):  # all'indietro: ogni item usato una volta
            dp[c] = max(dp[c], dp[c - weight] + value)
    return dp[capacity]

assert best_cart_value([(1, 15), (3, 20), (4, 30)], 4) == 35
```

| Problema | Stato e transizione |
|---|---|
| Unique Paths | `dp[r][c] = dp[r−1][c] + dp[r][c−1]`; basta una riga |
| Edit Distance | caratteri uguali → `dp[i−1][j−1]`; altrimenti `1 + min(cancella dp[i−1][j], inserisci dp[i][j−1], sostituisci dp[i−1][j−1])` |
| Coin Change II | numero di **combinazioni**: ciclo esterno sulle monete, interno sugli importi (`dp[x] += dp[x − c]`); con i cicli invertiti conteresti le permutazioni |
| Target Sum | `@cache` su `(indice, somma corrente)`, oppure riduzione a "sottoinsieme con somma data" |
| Best Time to Buy and Sell Stock with Cooldown | **macchina a stati**: `dp(i, posso_comprare)`; dopo una vendita salti un giorno |
| Interleaving String | `dp[i][j]` = `s3[:i+j]` si forma intrecciando `s1[:i]` e `s2[:j]` |
| Longest Increasing Path in a Matrix | DFS con `@cache` sulla cella: i valori strettamente crescenti escludono i cicli |
| Distinct Subsequences | caratteri uguali → `dp[i−1][j−1] + dp[i−1][j]`, altrimenti `dp[i−1][j]` |
| Burst Balloons | DP su **intervalli**: per `(l, r)` scegli quale palloncino scoppia per **ultimo** |
| Regular Expression Matching | `@cache` su `(i, j)`; con `x*` o salti il pattern (zero occorrenze) o consumi un carattere uguale |

## Domande da colloquio

**Base**
- **Backtracking o DP?** Backtracking se devi elencare le soluzioni; DP se ti basta contarle o trovare la migliore e i sottoproblemi si ripetono.
- **Come riconosci una DP?** Il testo chiede un conteggio o un ottimo ("quanti modi", "costo minimo") e la forza bruta ricalcola gli stessi sottoproblemi (lo vedi disegnando l'albero delle chiamate).

**Intermedio**
- **Memoization vs tabulazione?** Top-down è più naturale e calcola solo gli stati necessari; bottom-up evita lo stack di ricorsione e permette di ridurre lo spazio tenendo solo le righe necessarie.
- **Perché nella Coin Change II l'ordine dei cicli conta?** Con le monete nel ciclo esterno ogni combinazione si costruisce in un solo ordine (prima tutte le monete da 1, poi quelle da 2…); con gli importi nel ciclo esterno `1+2` e `2+1` vengono contati separatamente.
- **Come eviti risultati duplicati nel backtracking?** Ordina l'input e, allo stesso livello dell'albero, salta un valore uguale al precedente (`i > start and a[i] == a[i−1]`).

**Avanzato**
- **Complessità del backtracking su sottoinsiemi?** `O(2ⁿ · n)`: 2ⁿ sottoinsiemi, ciascuno copiato in `O(n)`. Per le permutazioni è `O(n! · n)`.
- **Come riduci lo spazio di una DP 2D?** Se `dp[i]` dipende solo da `dp[i−1]`, tieni una sola riga, aggiornandola nell'ordine giusto (all'indietro nello zaino 0/1).
- **Perché la LIS con `bisect` è corretta se `tails` non è una sottosequenza reale?** `tails` non è la soluzione, ma un riassunto: per ogni lunghezza conserva la coda migliore possibile. La sua lunghezza coincide con quella della LIS.

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — Backtracking, 1-D DP, 2-D DP
- [CP-Algorithms](https://cp-algorithms.com/) — DP e combinatoria spiegate con rigore
- [Python `functools.cache`](https://docs.python.org/3/library/functools.html#functools.cache) · [`bisect`](https://docs.python.org/3/library/bisect.html)
