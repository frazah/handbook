# Linked list e heap

> Le due strutture "a puntatori e priorità" degli esercizi: liste collegate da manipolare senza perdere nodi, heap per avere sempre a portata il minimo o il massimo. Copre le categorie Linked List e Heap / Priority Queue della roadmap NeetCode.
> Collegate: [Pattern algoritmici](Pattern%20algoritmici.md) · [Big-O e strutture dati](Big-O%20e%20strutture%20dati.md#heap-coda-di-priorità) (costi delle operazioni) · [Alberi e grafi](Alberi%20e%20grafi.md#cammini-minimi-con-pesi) (heap in Dijkstra e Prim)

## Modello mentale

- Una **linked list** è una catena di nodi: ogni operazione è uno spostamento di puntatori. I bug nascono quando sovrascrivi un `next` prima di averlo salvato, o quando trattare la testa richiede un caso speciale (lo elimina il **nodo dummy**).
- Due puntatori a velocità diverse (**lento e veloce**) trovano metà, cicli e l'n-esimo dalla fine senza conoscere la lunghezza.
- Un **heap** dà il minimo in `O(1)` e lo estrae o inserisce in `O(log n)`, ma non è ordinato: serve quando ti interessa *ripetutamente* il più piccolo o il più grande, non l'ordine completo.

## Sintassi al volo: segnale → tecnica

| Se il testo dice… | Tecnica |
|---|---|
| inverti, riordina, "n-esimo dalla fine" | puntatori + [nodo dummy](#linked-list) |
| ciclo, metà della lista, duplicato in `1..n` | [lento e veloce](#linked-list) |
| `get`/`put` in `O(1)` con espulsione del meno recente | LRU: dict + lista doppia |
| "k più grandi / vicini / frequenti" | [heap di dimensione k](#heap-top-k-e-due-heap) |
| mediana di valori che arrivano uno alla volta | [due heap](#heap-top-k-e-due-heap) |
| unire k sequenze ordinate | heap con un elemento per sequenza |

## Linked list

Disegna i nodi prima di scrivere codice. `from_list` e `to_list` servono solo a costruire e verificare gli esempi; su LeetCode `ListNode` è già definito.

```python
from dataclasses import dataclass

@dataclass
class ListNode:
    val: int
    next: "ListNode | None" = None

def from_list(values: list[int]) -> ListNode | None:
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(node: ListNode | None) -> list[int]:
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out
```

**Invertire** la lista: tre riferimenti (precedente, corrente, successivo). `O(n)` tempo, `O(1)` spazio.

```python
# continua dall'esempio precedente
def reverse(head: ListNode | None) -> ListNode | None:
    prev = None
    while head:
        nxt = head.next   # salva il resto prima di staccarlo
        head.next = prev  # gira il puntatore
        prev, head = head, nxt
    return prev

assert to_list(reverse(from_list([101, 102, 103]))) == [103, 102, 101]
```

Il **nodo dummy** (sentinella) è un nodo finto prima della testa: elimina il caso speciale "la testa cambia".

```python
# continua dall'esempio precedente
def merge_sorted(a: ListNode | None, b: ListNode | None) -> ListNode | None:
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b  # attacca ciò che resta di una delle due
    return dummy.next

assert to_list(merge_sorted(from_list([9, 12, 15]), from_list([10, 11]))) == [9, 10, 11, 12, 15]
```

**Puntatori lento e veloce:** uno avanza di 1, l'altro di 2. Se c'è un ciclo si incontrano (algoritmo di Floyd); quando il veloce arriva in fondo, il lento è a metà.

```python
# continua dall'esempio precedente
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

| Problema | Idea chiave |
|---|---|
| Remove Nth Node From End | dummy + due puntatori: il primo parte `n` passi avanti; quando arriva in fondo, il secondo precede il nodo da togliere |
| Reorder List | trova la metà (lento/veloce) → inverti la seconda metà → intreccia le due metà |
| Copy List with Random Pointer | dict nodo originale → copia; poi collega `next` e `random` delle copie |
| Add Two Numbers | somma cifra per cifra con il riporto, costruendo il risultato da un dummy |
| Find the Duplicate Number | l'array è una lista implicita (`i → nums[i]`): Floyd trova l'ingresso del ciclo, cioè il duplicato |
| Merge k Sorted Lists | heap di `(val, indice_lista, nodo)`: l'indice evita di confrontare due nodi a parità di valore |
| Reverse Nodes in k-Group | conta `k` nodi, inverti il blocco, ricollegalo al blocco precedente (dummy all'inizio) |
| LRU Cache | dict chiave → nodo + lista **doppia** in ordine d'uso; in Python `OrderedDict` ([esempio](../Languages/Python.md#dizionario-dict-hash-map-chiave--valore)) |

## Heap: top-k e due heap

Heap di dimensione `k`: `O(n log k)`. Lo stesso approccio fa il merge di `k` liste ordinate (`heapq.merge`).

```python
import heapq
from collections import Counter

def top_k_products(sold_skus: list[str], k: int) -> list[str]:
    counts = Counter(sold_skus)
    return [sku for sku, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]

assert top_k_products(["MUG", "PEN", "MUG", "BAG", "MUG", "PEN"], 2) == ["MUG", "PEN"]
```

Se serve **solo il k-esimo** elemento, l'alternativa è il **quickselect**: partiziona attorno a un pivot come il quicksort, ma prosegue solo nella metà che contiene la posizione cercata. `O(n)` in media, `O(n²)` nel caso peggiore (pivot sfortunati: sceglilo a caso), e modifica l'array.

**Due heap: mediana di uno stream.** Un max-heap tiene la metà inferiore dei valori, un min-heap quella superiore, e le due metà restano bilanciate (al più un elemento di differenza). La mediana sta in cima ai due heap: inserimento `O(log n)`, lettura `O(1)`.

```python
import heapq

class RunningMedian:
    """Mediana degli importi degli ordini man mano che arrivano."""
    def __init__(self) -> None:
        self.low: list[int] = []   # max-heap (valori negati): metà inferiore
        self.high: list[int] = []  # min-heap: metà superiore

    def add(self, cents: int) -> None:
        heapq.heappush(self.low, -cents)
        heapq.heappush(self.high, -heapq.heappop(self.low))  # il max di low passa a high
        if len(self.high) > len(self.low):                    # low tiene l'eventuale elemento in più
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
| Last Stone Weight | max-heap con valori negati; estrai due, reinserisci la differenza |
| K Closest Points to Origin | heap su `x² + y²` (la radice non cambia l'ordine) |
| Task Scheduler | conteggi: `max(len(tasks), (f_max − 1) · (n + 1) + quanti_hanno_f_max)` |
| Design Twitter | per ogni feed, merge dei tweet dei seguiti con un heap (come Merge k Sorted Lists) |

## Domande da colloquio

**Base**
- **Perché nella linked list si usa il nodo dummy?** Elimina i casi speciali sulla testa (lista vuota, rimozione del primo nodo): il risultato è sempre `dummy.next`.

**Intermedio**
- **k-esimo più grande: heap o quickselect?** Heap di dimensione `k`: `O(n log k)`, garantito e adatto allo streaming. Quickselect: `O(n)` in media ma `O(n²)` nel caso peggiore, e serve tutto l'array in memoria.
- **Come trova Floyd l'inizio del ciclo?** Dopo l'incontro, riparti con un puntatore dalla testa e uno dal punto d'incontro, entrambi a velocità 1: si incontrano all'ingresso del ciclo (la distanza dalla testa all'ingresso è uguale, modulo la lunghezza del ciclo, a quella dal punto d'incontro all'ingresso).

**Avanzato**
- **Perché la mediana con due heap e non una lista ordinata?** Inserire in una lista ordinata costa `O(n)` per lo spostamento degli elementi; con due heap l'inserimento è `O(log n)` e la mediana resta leggibile in `O(1)`.
- **Perché la LRU vuole una lista doppia e non singola?** Per staccare un nodo in `O(1)` serve il suo precedente: con la lista singola andrebbe cercato in `O(n)`.

## Approfondisci

- [NeetCode Roadmap](https://neetcode.io/roadmap) — Linked List, Heap / Priority Queue
- [Python `heapq`](https://docs.python.org/3/library/heapq.html) · [`collections.OrderedDict`](https://docs.python.org/3/library/collections.html#collections.OrderedDict)
