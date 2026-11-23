# Pattern algoritmici

> I template ricorrenti negli esercizi di coding (LeetCode, NeetCode) e nei live coding. Riconosci il pattern, copia lo scheletro, adattalo. Questa scheda copre array, stringhe, intervalli, greedy e matrici; liste e heap, alberi e grafi, backtracking e DP hanno schede proprie.
> Collegate: [Linked list e heap](Linked%20list%20e%20heap.md) · [Alberi e grafi](Alberi%20e%20grafi.md) · [Backtracking e DP](Backtracking%20e%20DP.md) · [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md) · [Python per gli esercizi](../Languages/Python.md#per-gli-esercizi-di-coding)

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
| "già visto", frequenze, anagrammi, raggruppa | [Hashing](#hashing-e-conteggi) |
| array **ordinato**, coppia/tripla con somma data, palindromo, in-place | [Two pointers](#two-pointers) |
| "sottoarray/sottostringa **contigua** più lunga/corta con…" | [Sliding window](#sliding-window) |
| "somma di un intervallo", "sottoarray con somma k" | [Prefix sum](#prefix-sum) |
| ordinato (anche ruotato), "minimo valore tale che…", `n` enorme | [Ricerca binaria](#ricerca-binaria) |
| intervalli, prenotazioni, sovrapposizioni | [Intervalli](#intervalli) |
| parentesi, "prossimo maggiore/minore", istogramma | [Stack monotono](#stack-e-stack-monotono) |
| lista collegata: inverti, unisci, ciclo, metà | [Linked list](Linked%20list%20e%20heap.md#linked-list) |
| "k più grandi/vicini/frequenti", mediana in streaming | [Heap](Linked%20list%20e%20heap.md#heap-top-k-e-due-heap) |
| "si può raggiungere?", una scelta locale che non serve rivedere | [Greedy](#greedy) |
| matrice da ruotare o percorrere a spirale, cifre, potenze | [Matrici e matematica](#matrici-e-matematica) |
| "senza spazio extra", XOR, conteggio di bit | [Bit manipulation](#bit-manipulation-essenziale) |
| alberi, BST, trie, griglie, dipendenze, cammini minimi | [Alberi e grafi](Alberi%20e%20grafi.md) |
| "tutte le combinazioni/permutazioni/sottoinsiemi" | [Backtracking](Backtracking%20e%20DP.md#backtracking) |
| "numero di modi", "minimo costo", "massimo con scelte" | [Programmazione dinamica](Backtracking%20e%20DP.md#programmazione-dinamica) |

**Roadmap NeetCode:** qui trovi Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Intervals, Greedy, Math & Geometry e Bit Manipulation; il resto è nelle schede collegate. Nelle tabelle *Problema → idea chiave* i nomi sono quelli di LeetCode.

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
| Generate Parentheses | è backtracking: [vedi qui](Backtracking%20e%20DP.md#backtracking) |

## Greedy

Fai a ogni passo la scelta che sembra migliore, senza tornare indietro. Funziona solo quando sai giustificare che quella scelta non preclude l'ottimo (argomento di scambio); se trovi un controesempio, serve la [DP](Backtracking%20e%20DP.md#programmazione-dinamica). Il codice è corto: la difficoltà sta nel trovare la regola.

| Problema | Idea chiave |
|---|---|
| Maximum Subarray | Kadane: estendi la somma corrente solo se è positiva ([codice](Backtracking%20e%20DP.md#dp-1d)) |
| Jump Game | tieni l'indice più lontano raggiungibile; se `i` lo supera, non arrivi in fondo |
| Jump Game II | BFS "a livelli" sugli indici: ogni salto estende la frontiera fino al più lontano raggiungibile |
| Gas Station | se il totale `gas − cost` è ≥ 0 una soluzione esiste; quando il serbatoio va sotto zero, riparti dalla stazione successiva |
| Hand of Straights | `Counter`; parti sempre dalla carta più piccola rimasta e consuma `k` consecutive |
| Merge Triplets to Form Target | scarta le triple con un valore oltre il target; le altre devono coprire ogni coordinata del target |
| Partition Labels | salva l'ultima posizione di ogni lettera; chiudi il blocco quando `i` raggiunge la più lontana tra quelle viste |
| Valid Parenthesis String | tieni l'intervallo `[min, max]` di parentesi aperte possibili; `*` lo allarga; se `max < 0` è invalida |

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

**Intermedio**
- **Sliding window vs two pointers?** La sliding window è un caso di two pointers dove interessa il contenuto *tra* i puntatori (sottoarray contiguo). Non funziona se gli elementi negativi rompono la monotonia della somma: lì serve il prefix sum.
- **Come capisci che il greedy è corretto?** Con un argomento di scambio: qualsiasi soluzione ottima può essere trasformata in quella greedy senza peggiorare. Se trovi un controesempio, passa alla DP.
- **Come eviti i duplicati in 3Sum senza un set?** Ordinando: i valori uguali diventano adiacenti, e basta saltare quelli uguali al precedente sia per il primo elemento sia per il secondo.

**Avanzato**
- **Perché in Trapping Rain Water bastano due puntatori?** L'acqua sopra una barra dipende dal minimo tra il massimo alla sua sinistra e quello alla sua destra. Se il massimo sinistro è il più basso dei due, quel minimo è già noto per la barra di sinistra (a destra c'è comunque una barra almeno altrettanto alta): la calcoli e avanzi.

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — esercizi raggruppati per pattern
- [CP-Algorithms](https://cp-algorithms.com/) — algoritmi spiegati con rigore
- [Python `bisect`](https://docs.python.org/3/library/bisect.html) · [`heapq`](https://docs.python.org/3/library/heapq.html)
