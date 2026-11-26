# Pattern algoritmici

> I template ricorrenti negli esercizi di coding (LeetCode, NeetCode) e nei live coding. Riconosci il pattern, copia lo scheletro, adattalo.  
> Questa scheda copre array, stringhe, intervalli, greedy, backtracking, DP e matrici; le tecniche legate a una struttura (liste, heap, alberi, trie, grafi) sono in [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md).  
> Collegate: [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md) · [Python per gli esercizi](../Languages/Python.md#per-gli-esercizi-di-coding)

## Modello mentale

- Quasi ogni esercizio è una variante di una ventina di pattern: il lavoro vero è **riconoscerlo** dai segnali del testo.
- Parti sempre dalla **forza bruta**, stimane il costo, poi chiediti quale lavoro ripetuto puoi evitare (memorizzarlo, ordinare prima, usare una struttura migliore).
- I vincoli su `n` ti dicono la complessità attesa ([tabella](Big-O%20e%20strutture%20dati.md#dai-vincoli-alla-complessità-attesa)).
- Ottimizzare quasi sempre significa scambiare memoria per tempo (hash map, memo, prefix sum).
- **Backtracking** quando servono *tutte* le soluzioni, **DP** quando ne basta il numero o la migliore: partono dallo stesso albero delle decisioni, ma la DP calcola ogni sottoproblema una volta sola.
- Gli edge case uccidono più dei bug logici: input vuoto, un solo elemento, duplicati, negativi, overflow (in JS), tutto uguale.

### Metodo in 6 passi (anche per il colloquio)

1. **Chiarisci:** input, output, vincoli, duplicati, ordinamento, valori negativi. Ripeti il problema a voce.
2. **Esempi:** uno normale e uno limite, calcolati a mano.
3. **Forza bruta:** dilla e dai la complessità, anche se non la scrivi.
4. **Ottimizza:** individua il pattern (tabella sotto) e spiega l'idea *prima* di scrivere codice.
5. **Scrivi** codice pulito con nomi chiari, ragionando ad alta voce.
6. **Testa** sugli esempi e sugli edge case, poi dichiara la complessità in tempo e spazio.

## Sintassi al volo: segnale → pattern

| Se il testo dice… | Pensa a |
|---|---|
| "già visto", frequenze, anagrammi, raggruppa | [Hashing](#hashing-e-conteggi) |
| array **ordinato**, coppia/tripla con somma data, palindromo, in-place | [Two pointers](#two-pointers) |
| "sottoarray/sottostringa **contigua** più lunga/corta con…" | [Sliding window](#sliding-window) |
| "somma di un intervallo", "sottoarray con somma k" | [Prefix sum](#prefix-sum) |
| ordinato (anche ruotato), "minimo valore tale che…", `n` enorme | [Ricerca binaria](#ricerca-binaria) |
| intervalli, prenotazioni, sovrapposizioni | [Intervalli](#intervalli) |
| parentesi, "prossimo maggiore/minore", istogramma | [Stack monotono](#stack-e-stack-monotono) |
| lista collegata: inverti, unisci, ciclo, metà | [Linked list](Big-O%20e%20strutture%20dati.md#linked-list) |
| "k più grandi/vicini/frequenti", mediana in streaming | [Heap](Big-O%20e%20strutture%20dati.md#heap-coda-di-priorità) |
| "si può raggiungere?", una scelta locale che non serve rivedere | [Greedy](#greedy) |
| matrice da ruotare o percorrere a spirale, cifre, potenze | [Matrici e matematica](#matrici-e-matematica) |
| "senza spazio extra", XOR, conteggio di bit | [Bit manipulation](#bit-manipulation-essenziale) |
| alberi: profondità, diametro, livelli, BST | [Alberi e BST](Big-O%20e%20strutture%20dati.md#alberi-e-bst) |
| prefissi, autocompletamento | [Trie](Big-O%20e%20strutture%20dati.md#trie) |
| isole, regioni, "dopo quanti minuti…", distanza minima in passi | [BFS e DFS su griglia](Big-O%20e%20strutture%20dati.md#bfs-e-dfs-su-griglia) |
| prerequisiti, ordine valido | [Ordinamento topologico](Big-O%20e%20strutture%20dati.md#ordinamento-topologico) |
| cammino minimo con pesi, collegare tutto al costo minimo | [Dijkstra e MST](Big-O%20e%20strutture%20dati.md#cammini-minimi-e-mst) |
| gruppi che si fondono, arco ridondante | [Union-Find](Big-O%20e%20strutture%20dati.md#union-find-disjoint-set) |
| "tutte le combinazioni/permutazioni/sottoinsiemi" | [Backtracking](#backtracking) |
| "numero di modi", "minimo costo", "massimo con scelte" | [Programmazione dinamica](#programmazione-dinamica) |

**Roadmap NeetCode:** qui trovi Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Intervals, Greedy, Backtracking, 1-D e 2-D DP, Math & Geometry e Bit Manipulation; Linked List, Trees, Tries, Heap e Graphs sono in [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md). Nelle tabelle *Problema → idea chiave* i nomi sono quelli di LeetCode.

## Hashing e conteggi

Memorizza ciò che hai visto per rispondere in `O(1)`. Tempo `O(n)`, spazio `O(n)`.

```python
from collections import Counter

def first_unique_sku(skus: list[str]) -> str | None:
    counts = Counter(skus)  # passata 1: frequenze
    return next((s for s in skus if counts[s] == 1), None)  # passata 2: ordine originale

assert first_unique_sku(["MUG", "PEN", "MUG", "BAG"]) == "PEN"
```

| Problema | Idea chiave |
|---|---|
| Two Sum | dict valore → indice; cerca `target - x` *prima* di inserire `x` |
| Group Anagrams | chiave del dict = `tuple(sorted(word))`, oppure il conteggio delle 26 lettere |
| Top K Frequent Elements | `Counter` + heap, oppure **bucket sort**: `buckets[frequenza]` → lista, letti dal fondo: `O(n)` |
| Product of Array Except Self | prodotto di tutto ciò che sta a sinistra × tutto ciò che sta a destra, in due passate, senza divisione |
| Longest Consecutive Sequence | metti tutto in un `set`; conta in avanti solo da `x` con `x - 1` assente: ogni numero si visita una volta |
| Valid Sudoku | un set per riga, per colonna e per box; il box di `(r, c)` è `(r // 3, c // 3)` |
| Encode and Decode Strings | prefisso con la lunghezza (`"5#hello"`): un `#` dentro il testo non confonde il parsing |

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

**3Sum** riduce il problema al precedente: ordina, fissa il primo elemento e cerca la coppia con due puntatori. La parte delicata sono i **duplicati**: salta i valori uguali al precedente, sia per il primo elemento sia dopo aver trovato una tripla. `O(n²)`.

```python
def three_sum(nums: list[int]) -> list[tuple[int, int, int]]:
    nums = sorted(nums)
    out = []
    for i, first in enumerate(nums):
        if i > 0 and first == nums[i - 1]:
            continue  # stesso primo elemento: triple già trovate
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = first + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                out.append((first, nums[left], nums[right]))
                left += 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1  # salta i duplicati del secondo elemento
    return out

assert three_sum([-1, 0, 1, 2, -1, -4]) == [(-1, -1, 2), (-1, 0, 1)]
```

| Problema | Idea chiave |
|---|---|
| Valid Palindrome | puntatori dai due estremi; salta i caratteri non alfanumerici (`ch.isalnum()`) |
| Container With Most Water | area = larghezza × lato più basso; sposta sempre il lato **più basso**, l'unico che può migliorare |
| Trapping Rain Water | sopra ogni barra c'è `min(max a sinistra, max a destra) − altezza`; con due puntatori avanza il lato con il massimo minore |

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

**Finestra con conteggi** (la più piccola che contiene tutti i caratteri richiesti): allarga finché la finestra è valida, poi restringi finché resta valida, aggiornando il migliore.

```python
from collections import Counter

def min_window(s: str, t: str) -> str:
    need = Counter(t)  # quanti ne mancano per carattere (negativo = in eccesso)
    missing = len(t)   # caratteri di t non ancora coperti
    left, best = 0, (0, len(s))
    found = False
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:  # valida: prova a restringerla
            found = True
            if right - left < best[1] - best[0]:
                best = (left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1  # abbiamo tolto un carattere necessario
            left += 1
    return s[best[0]:best[1] + 1] if found else ""

assert min_window("ADOBECODEBANC", "ABC") == "BANC"
```

| Problema | Idea chiave |
|---|---|
| Best Time to Buy and Sell Stock | tieni il prezzo minimo visto finora; profitto = prezzo − minimo |
| Longest Repeating Character Replacement | la finestra è valida se `lunghezza − frequenza_massima ≤ k` |
| Permutation in String | finestra **fissa** lunga `len(s1)`: aggiungi `a[right]`, togli `a[right − k]`, confronta i conteggi |
| Sliding Window Maximum | **deque monotona** di indici con valori decrescenti: togli in coda i più piccoli del nuovo, in testa gli indici usciti; il massimo è in testa. `O(n)` |

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

**Array ordinato e ruotato** (`[4, 5, 6, 1, 2, 3]`): confrontando `mid` con l'estremo destro capisci in quale metà sta il "gradino".

```python
def find_min_rotated(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # il gradino è a destra di mid
        else:
            hi = mid      # mid è nella parte bassa: il minimo è mid o prima
    return nums[lo]

assert find_min_rotated([4, 5, 6, 1, 2, 3]) == 1
```

| Problema | Idea chiave |
|---|---|
| Binary Search | `while lo <= hi` con `hi = mid − 1` / `lo = mid + 1`; se esci dal ciclo, non c'è |
| Search a 2D Matrix | tratta la matrice come un array lungo `rows · cols`: `r, c = divmod(mid, cols)` |
| Koko Eating Bananas | ricerca sulla risposta (la velocità), come `min_capacity` |
| Search in Rotated Sorted Array | una delle due metà è sempre ordinata: controlla se il target cade lì, altrimenti vai nell'altra |
| Time Based Key-Value Store | per ogni chiave una lista di `(timestamp, valore)` già ordinata + `bisect_right` |
| Median of Two Sorted Arrays | ricerca binaria sul punto di taglio dell'array più corto, così che le due metà sinistre siano metà del totale |

In Python, sugli array ordinati usa direttamente `bisect.bisect_left` / `bisect_right`.

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

**Quante sale servono** (massimo di intervalli sovrapposti): un min-heap tiene gli orari di fine delle sale occupate; se la prima a liberarsi è libera all'inizio della riunione, la riusi.

```python
import heapq

def rooms_needed(meetings: list[tuple[int, int]]) -> int:
    ends: list[int] = []
    for start, end in sorted(meetings):
        if ends and ends[0] <= start:
            heapq.heappop(ends)  # la sala che si libera prima è di nuovo disponibile
        heapq.heappush(ends, end)
    return len(ends)

assert rooms_needed([(9, 10), (9, 12), (11, 13)]) == 2
```

| Problema | Idea chiave |
|---|---|
| Insert Interval | copia quelli che finiscono prima, fondi quelli sovrapposti, copia quelli dopo |
| Non-overlapping Intervals | greedy: ordina per **fine** e tieni il primo compatibile; da rimuovere = totale − tenuti |
| Meeting Rooms | ordina per inizio: ogni riunione deve iniziare dopo la fine della precedente |
| Minimum Interval to Include Each Query | query ordinate + heap degli intervalli già iniziati, per lunghezza; scarta quelli finiti |

## Stack e stack monotono

Lo stack monotono tiene elementi in ordine crescente o decrescente e risolve "il prossimo maggiore" in `O(n)`: ogni indice entra ed esce una volta sola.

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

**Rettangolo più grande in un istogramma:** stack crescente di indici. Quando una barra più bassa ne fa uscire una, il rettangolo alto quanto la barra estratta si estende tra i due vicini più bassi.

```python
def largest_rectangle(heights: list[int]) -> int:
    bars = heights + [0]   # lo 0 finale svuota lo stack
    stack: list[int] = []  # indici con altezze crescenti
    best = 0
    for i, h in enumerate(bars):
        while stack and bars[stack[-1]] >= h:
            height = bars[stack.pop()]
            left = stack[-1] + 1 if stack else 0  # primo indice in cui la barra "regge"
            best = max(best, height * (i - left))
        stack.append(i)
    return best

assert largest_rectangle([2, 1, 5, 6, 2, 3]) == 10
```

| Problema | Idea chiave |
|---|---|
| Valid Parentheses | push delle aperte; a ogni chiusa il top deve essere la sua aperta; alla fine lo stack è vuoto |
| Min Stack | ogni elemento salva anche il minimo fino a lì: `(val, min(val, minimo_precedente))` |
| Evaluate Reverse Polish Notation | stack di numeri; la divisione tronca verso zero: `int(a / b)`, non `a // b` |
| Car Fleet | ordina per posizione decrescente e calcola il tempo d'arrivo; chi arriva prima di chi gli sta davanti si unisce alla sua flotta |
| Generate Parentheses | è backtracking: [vedi qui](#backtracking) |

## Greedy

Fai a ogni passo la scelta che sembra migliore, senza tornare indietro. Funziona solo quando sai giustificare che quella scelta non preclude l'ottimo (argomento di scambio); se trovi un controesempio, serve la [DP](#programmazione-dinamica). Il codice è corto: la difficoltà sta nel trovare la regola.

| Problema | Idea chiave |
|---|---|
| Maximum Subarray | Kadane: `current = max(x, current + x)`, cioè estendi la serie solo se è positiva; il risultato è il massimo di `current` |
| Jump Game | tieni l'indice più lontano raggiungibile; se `i` lo supera, non arrivi in fondo |
| Jump Game II | BFS "a livelli" sugli indici: ogni salto estende la frontiera fino al più lontano raggiungibile |
| Gas Station | se il totale `gas − cost` è ≥ 0 una soluzione esiste; quando il serbatoio va sotto zero, riparti dalla stazione successiva |
| Hand of Straights | `Counter`; parti sempre dalla carta più piccola rimasta e consuma `k` consecutive |
| Merge Triplets to Form Target | scarta le triple con un valore oltre il target; le altre devono coprire ogni coordinata del target |
| Partition Labels | salva l'ultima posizione di ogni lettera; chiudi il blocco quando `i` raggiunge la più lontana tra quelle viste |
| Valid Parenthesis String | tieni l'intervallo `[min, max]` di parentesi aperte possibili; `*` lo allarga; se `max < 0` è invalida |

## Backtracking

Serve quando vuoi *tutte* le soluzioni (combinazioni, permutazioni, sottoinsiemi). Esplora l'albero delle scelte: **scegli → ricorri → annulla la scelta**. È esponenziale, quindi adatto a `n` piccoli (≤ 20 circa); si accelera **potando** i rami che non possono portare a una soluzione.

**Sottoinsiemi:** per ogni elemento, prendo o non prendo.

```python
def subsets(items: list[str]) -> list[list[str]]:
    out: list[list[str]] = []
    def explore(i: int, chosen: list[str]) -> None:
        if i == len(items):
            out.append(chosen.copy())  # copia: chosen verrà modificata
            return
        chosen.append(items[i])  # prendo items[i]
        explore(i + 1, chosen)
        chosen.pop()             # annullo: non lo prendo
        explore(i + 1, chosen)
    explore(0, [])
    return out

assert len(subsets(["MUG", "PEN", "BAG"])) == 8  # 2³
```

**Combinazioni:** a ogni livello scegli il prossimo elemento da `start` in poi. Ordinare l'input permette sia di potare sia di saltare i duplicati.

```python
def bundles_with_budget(prices: list[int], budget: int) -> list[list[int]]:
    """Tutte le combinazioni di prodotti (ognuno al più una volta) che costano esattamente budget."""
    prices = sorted(prices)
    out: list[list[int]] = []
    def explore(start: int, remaining: int, chosen: list[int]) -> None:
        if remaining == 0:
            out.append(chosen.copy())
            return
        for i in range(start, len(prices)):
            if prices[i] > remaining:
                break     # potatura: da qui in poi sono tutti troppo cari
            if i > start and prices[i] == prices[i - 1]:
                continue  # stesso valore allo stesso livello: combinazione doppia
            chosen.append(prices[i])
            explore(i + 1, remaining - prices[i], chosen)
            chosen.pop()
    explore(0, budget, [])
    return out

assert bundles_with_budget([10, 5, 10, 15], 25) == [[5, 10, 10], [10, 15]]
```

| Problema | Idea chiave |
|---|---|
| Combination Sum | come sopra, ma ricorri con `i` invece di `i + 1`: lo stesso elemento si può riusare |
| Subsets II / Combination Sum II | ordina e salta `a[i] == a[i − 1]` quando `i > start` |
| Permutations | a ogni livello qualsiasi elemento non ancora usato (set degli usati, o lista dei rimanenti) |
| Word Search | su griglia: segna la cella, prova le 4 direzioni, poi liberala |
| Generate Parentheses | aggiungi `(` se `aperte < n`, `)` se `chiuse < aperte` |
| Palindrome Partitioning | scegli dove finisce il prossimo pezzo; prosegui solo se è palindromo |
| N-Queens | una regina per riga; set di colonne, diagonali `r − c` e antidiagonali `r + c` occupate |

## Programmazione dinamica

Serve quando il testo chiede **un numero** (quanti modi, costo minimo, valore massimo) e la forza bruta ricalcola gli stessi sottoproblemi. Ogni stato si calcola una volta: costo = numero di stati × costo di una transizione.

1. **Stato:** cosa significa `dp[i]` (o `dp[i][j]`), in una frase. Trucco: scrivi la ricorsione a forza bruta; gli **argomenti che cambiano** sono lo stato.
2. **Transizione:** come `dp[i]` dipende da stati più piccoli.
3. **Casi base** e ordine di calcolo.
4. **Memoization** (ricorsione + `@cache`) è la più facile da scrivere; la **tabulazione** (ciclo dal basso) evita il limite di ricorsione e permette di ridurre lo spazio.

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
    take = skip = 0  # bastano gli ultimi due stati: spazio O(1)
    for value in values:
        take, skip = skip + value, max(take, skip)
    return max(take, skip)

assert max_loot([2, 7, 9, 3, 1]) == max_loot_table([2, 7, 9, 3, 1]) == 12
```

### DP 1D

| Problema | Stato e transizione |
|---|---|
| Climbing Stairs | `dp[i] = dp[i−1] + dp[i−2]` (Fibonacci) |
| House Robber II | case in cerchio: risolvi senza la prima e senza l'ultima, prendi il massimo |
| Coin Change | `dp[x] = 1 + min(dp[x − c])` sulle monete `c`; `inf` se irraggiungibile |
| Decode Ways | `dp[i] = dp[i−1]` (se la cifra non è 0) `+ dp[i−2]` (se le ultime due cifre sono tra 10 e 26) |
| Word Break | `dp[i]` = il prefisso lungo `i` si compone: esiste `j` con `dp[j]` e `s[j:i]` nel dizionario |
| Longest Increasing Subsequence | `dp[i] = 1 + max(dp[j])` per `j < i` con `a[j] < a[i]`: `O(n²)`; con `bisect` sulle code minime `O(n log n)` |
| Longest Palindromic Substring | espandi attorno a ognuno dei `2n − 1` centri: `O(n²)`, spazio `O(1)` |
| Maximum Product Subarray | come Kadane, ma tieni massimo **e minimo** che finiscono in `i`: un negativo li scambia |

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

| Problema | Stato e transizione |
|---|---|
| Unique Paths | `dp[r][c] = dp[r−1][c] + dp[r][c−1]`; basta una riga |
| Edit Distance | uguali → `dp[i−1][j−1]`; altrimenti `1 + min(cancella, inserisci, sostituisci)` |
| Zaino 0/1 / Partition Equal Subset Sum | `dp[c]` = meglio con capacità `c`; scorri `c` **all'indietro** così ogni oggetto si usa una volta |
| Coin Change II | conta le **combinazioni**: ciclo esterno sulle monete, interno sugli importi (`dp[x] += dp[x − c]`) |
| Best Time to Buy and Sell Stock with Cooldown | macchina a stati: `@cache` su `(i, posso_comprare)`; dopo una vendita salti un giorno |
| Longest Increasing Path in a Matrix | DFS con `@cache` sulla cella: i valori strettamente crescenti escludono i cicli |

## Matrici e matematica

Con le matrici il rischio sono gli indici: dai un nome ai bordi (`top`, `bottom`, `left`, `right`) e aggiornali uno alla volta.

```python
def spiral(m: list[list[int]]) -> list[int]:
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        out += [m[top][c] for c in range(left, right + 1)]       # riga in alto →
        out += [m[r][right] for r in range(top + 1, bottom + 1)] # colonna a destra ↓
        if top < bottom and left < right:  # evita di ripercorrere una riga o colonna singola
            out += [m[bottom][c] for c in range(right - 1, left - 1, -1)]  # riga in basso ←
            out += [m[r][left] for r in range(bottom - 1, top, -1)]        # colonna a sinistra ↑
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return out

assert spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) == [1, 2, 3, 6, 9, 8, 7, 4, 5]
```

| Problema | Idea chiave |
|---|---|
| Rotate Image | 90° in senso orario, in-place: trasposta (`m[r][c] ↔ m[c][r]`), poi inverti ogni riga |
| Set Matrix Zeroes | prima raccogli righe e colonne da azzerare, poi azzera; in `O(1)` spazio usa prima riga e prima colonna come marcatori |
| Happy Number | la sequenza arriva a 1 oppure entra in un ciclo: set dei valori visti (o lento/veloce) |
| Plus One | scorri da destra con il riporto; se resta un riporto, aggiungi `1` in testa |
| Pow(x, n) | esponenziazione rapida: `xⁿ = (x^(n/2))²` (× `x` se `n` è dispari), `O(log n)`; con `n < 0` calcola `1 / x^(−n)` |
| Multiply Strings | moltiplicazione in colonna: `res[i + j + 1] += d1 · d2`, poi propaga i riporti |
| Detect Squares | conta i punti; per ogni punto sulla diagonale della query cerca gli altri due angoli |

## Bit manipulation essenziale

| Operazione | Codice |
|---|---|
| bit `i` acceso? | `x >> i & 1` |
| accendi il bit `i` | `x \| (1 << i)` |
| spegni il bit meno significativo | `x & (x - 1)` |
| potenza di due? | `x > 0 and x & (x - 1) == 0` |
| quanti bit a 1 (Number of 1 Bits) | `bin(x).count("1")`, o ciclo con `x &= x - 1` |
| bit di tutti i numeri fino a `n` (Counting Bits) | `bits[i] = bits[i >> 1] + (i & 1)` |
| elemento che compare una volta sola (gli altri due volte) | XOR di tutti gli elementi |
| numero mancante in `0..n` (Missing Number) | XOR di indici e valori, oppure `n(n+1)/2 − sum(nums)` |
| interi a 32 bit (Sum of Two Integers, Reverse Bits) | Python non ha overflow: applica `& 0xFFFFFFFF` e riconverti i negativi |

## Domande da colloquio

**Base**
- **Come affronti un problema che non conosci?** Chiarisco vincoli ed esempi, propongo la forza bruta con la sua complessità, poi cerco il lavoro ripetuto da eliminare e il pattern corrispondente.
- **Quando la ricerca binaria?** Su dati ordinati, o su una risposta monotona ("con capacità x ce la faccio?").
- **Perché lo stack monotono è `O(n)` anche con un `while` dentro il `for`?** Ogni indice entra nello stack una volta ed esce al più una volta: il totale delle operazioni è `2n`.

- **Backtracking o DP?** Backtracking se devi elencare le soluzioni; DP se ti basta contarle o trovare la migliore e i sottoproblemi si ripetono.

**Intermedio**
- **Sliding window vs two pointers?** La sliding window è un caso di two pointers dove interessa il contenuto *tra* i puntatori (sottoarray contiguo). Non funziona se gli elementi negativi rompono la monotonia della somma: lì serve il prefix sum.
- **Come capisci che il greedy è corretto?** Con un argomento di scambio: qualsiasi soluzione ottima può essere trasformata in quella greedy senza peggiorare. Se trovi un controesempio, passa alla DP.
- **Come eviti i duplicati in 3Sum senza un set?** Ordinando: i valori uguali diventano adiacenti, e basta saltare quelli uguali al precedente sia per il primo elemento sia per il secondo.

- **Memoization vs tabulazione?** Top-down è più naturale e calcola solo gli stati necessari; bottom-up evita lo stack di ricorsione e permette di tenere solo le righe che servono.
- **Come eviti risultati duplicati nel backtracking?** Ordina l'input e, allo stesso livello dell'albero, salta un valore uguale al precedente (`i > start and a[i] == a[i−1]`).

**Avanzato**
- **Perché in Coin Change II l'ordine dei cicli conta?** Con le monete nel ciclo esterno ogni combinazione si costruisce in un solo ordine; con gli importi nel ciclo esterno `1+2` e `2+1` contano come due.
- **Complessità del backtracking su sottoinsiemi?** `O(2ⁿ · n)`: 2ⁿ sottoinsiemi, ciascuno copiato in `O(n)`. Per le permutazioni `O(n! · n)`.
- **Perché in Trapping Rain Water bastano due puntatori?** L'acqua sopra una barra dipende dal minimo tra il massimo alla sua sinistra e quello alla sua destra. Se il massimo sinistro è il più basso dei due, quel minimo è già noto per la barra di sinistra (a destra c'è comunque una barra almeno altrettanto alta): la calcoli e avanzi.

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — esercizi raggruppati per pattern
- [CP-Algorithms](https://cp-algorithms.com/) — algoritmi spiegati con rigore
- [Python `bisect`](https://docs.python.org/3/library/bisect.html) · [`heapq`](https://docs.python.org/3/library/heapq.html) · [`functools.cache`](https://docs.python.org/3/library/functools.html#functools.cache)
