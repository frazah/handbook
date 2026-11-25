# NeetCode 150

> Un notebook per ogni categoria della roadmap [NeetCode 150](https://neetcode.io/practice): la sintassi Python e i concetti che ti servono per risolvere quei problemi, da tenere aperto mentre li risolvi. Le idee risolutive per i singoli problemi sono nelle schede di [Fundamentals](../Fundamentals/), a cui ogni notebook rimanda.

## Come usarli

1. Apri il notebook della categoria e cerca il problema nella tabella **Problemi → cosa ti serve**: ti dice quale concetto e quale sintassi usare.
2. Salta alla sezione corrispondente: introduzione breve, codice eseguibile con l'output atteso (`# ->`), errori comuni.
3. I notebook **non contengono le soluzioni**: gli esempi usano dati diversi (spesso il negozio online del [dominio comune](../README.md#dominio-comune)).

Le celle si eseguono dall'alto in basso; quelle che dipendono da una cella precedente lo dicono nella prima riga (`# continua dall'esempio precedente`). Serve Python ≥ 3.10.

## Indice

| # | Categoria | Problemi | Concetti principali |
|---|---|---|---|
| 01 | [Arrays & Hashing](01%20-%20Arrays%20%26%20Hashing.ipynb) | 9 | `set`, `dict`, `Counter`, `defaultdict`, bucket sort, prefix/suffix |
| 02 | [Two Pointers](02%20-%20Two%20Pointers.ipynb) | 5 | estremi verso il centro, array ordinato, saltare i duplicati |
| 03 | [Sliding Window](03%20-%20Sliding%20Window.ipynb) | 6 | finestra variabile e fissa, conteggi, deque monotona |
| 04 | [Stack](04%20-%20Stack.ipynb) | 7 | stack con lista, classi "design", stack monotono |
| 05 | [Binary Search](05%20-%20Binary%20Search.ipynb) | 7 | due template, ricerca sulla risposta, `bisect`, array ruotati |
| 06 | [Linked List](06%20-%20Linked%20List.ipynb) | 11 | dummy, inversione, fast/slow, `OrderedDict`, heap di nodi |
| 07 | [Trees](07%20-%20Trees.ipynb) | 15 | DFS (cosa restituisci / cosa passi), `nonlocal`, BFS per livelli, inorder |
| 08 | [Tries](08%20-%20Tries.ipynb) | 3 | `TrieNode`, dict annidati, wildcard, trie + griglia |
| 09 | [Heap & Priority Queue](09%20-%20Heap%20%26%20Priority%20Queue.ipynb) | 7 | `heapq`, max-heap negato, top-k, due heap |
| 10 | [Backtracking](10%20-%20Backtracking.ipynb) | 9 | scegli/esplora/annulla, `start`, duplicati, `used`, griglia |
| 11 | [Graphs](11%20-%20Graphs.ipynb) | 13 | griglie, BFS multi-sorgente, adiacenza, Kahn, Union-Find |
| 12 | [Advanced Graphs](12%20-%20Advanced%20Graphs.ipynb) | 6 | Dijkstra, Prim, Bellman-Ford limitato, Hierholzer |
| 13 | [1-D Dynamic Programming](13%20-%201-D%20Dynamic%20Programming.ipynb) | 12 | `@cache`, tabella, due variabili, centri, LIS con `bisect` |
| 14 | [2-D Dynamic Programming](14%20-%202-D%20Dynamic%20Programming.ipynb) | 11 | tabelle 2D, due stringhe, macchina a stati, intervalli |
| 15 | [Greedy](15%20-%20Greedy.ipynb) | 8 | Kadane, raggiungibilità, ultima occorrenza, intervallo `[lo, hi]` |
| 16 | [Intervals](16%20-%20Intervals.ipynb) | 6 | ordina e unisci, ordina per fine, heap delle fini, query offline |
| 17 | [Math & Geometry](17%20-%20Math%20%26%20Geometry.ipynb) | 8 | trasposta, spirale, cifre e riporti, potenza veloce |
| 18 | [Bit Manipulation](18%20-%20Bit%20Manipulation.ipynb) | 7 | operatori, XOR, `n & (n - 1)`, maschera a 32 bit |

**Ordine consigliato:** quello della tabella. Trees viene prima di Tries, Heap, Backtracking e Graphs; 1-D DP prima di 2-D DP.
