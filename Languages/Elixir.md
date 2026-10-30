# Elixir

> Linguaggio funzionale sulla **BEAM**, la VM di Erlang: concorrenza a milioni di processi leggeri, tolleranza ai guasti, sistemi sempre attivi (chat, realtime, IoT, backend con Phoenix).
> Collegate: [Pattern algoritmici](../Fundamentals/Pattern%20algoritmici.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md)

## Modello mentale

- **Immutabilità:** i dati non cambiano mai. "Modificare" una mappa restituisce una nuova mappa (condividendo internamente la struttura invariata).
- **`=` è pattern matching**, non assegnazione: verifica che il lato destro abbia la forma del sinistro e lega le variabili. Una variabile può essere *rilegata*, ma il valore precedente non cambia.
- **Processi BEAM**, non thread del sistema operativo: costano pochi KB, sono isolati (nessuna memoria condivisa), comunicano **solo con messaggi** e hanno ciascuno il proprio garbage collector.
- Lo **scheduler** della BEAM è preemptive (a riduzioni) con uno scheduler per core: un processo lento non blocca gli altri, quindi la latenza resta prevedibile.
- **"Let it crash":** invece di difendersi da ogni errore, un processo può morire; un **supervisor** lo riavvia in uno stato pulito.
- **OTP** è la libreria standard di astrazioni affidabili: GenServer, Supervisor, Application.
- Gli errori attesi sono **valori** (`{:ok, x}` / `{:error, reason}`); le eccezioni restano per i casi davvero eccezionali.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Atomo | `:paid`, `:ok` (costanti col nome come valore) |
| Tupla / lista | `{:ok, order}` · `[1, 2, 3]` (lista concatenata: `[head \| tail]`) |
| Mappa | `%{"sku" => "MUG-2"}` · `%{sku: "MUG-2"}` e accesso con `order.sku` |
| Aggiornare una mappa | `%{order \| status: :paid}` (la chiave deve esistere) |
| Keyword list | `[limit: 20, sort: :desc]` (opzioni delle funzioni) |
| Stringa vs charlist | `"ciao"` (binario UTF-8) · `~c"ciao"` (lista di codepoint) |
| Interpolazione | `"Totale: #{total}"` |
| Funzione anonima | `fn x -> x * 2 end` · `&(&1 * 2)` · chiamata con `f.(3)` |
| Cattura di una funzione | `&String.upcase/1` (nome/arità) |
| Pipe | `orders \|> Enum.filter(&paid?/1) \|> Enum.map(& &1.total)` |
| Struct | `%Order{id: 1, status: :pending}` |
| Sigil | `~w(paid shipped)a` → `[:paid, :shipped]` |

## Pattern matching e funzioni

Il pattern matching sostituisce gran parte degli `if`: ogni **clausola** di una funzione gestisce una forma dell'input, e la prima che corrisponde vince. Le **guard** (`when`) aggiungono condizioni.

```elixir
defmodule Shop.Pricing do
  @vat_rate 22  # attributo di modulo: costante a compile time

  def describe({:ok, %{status: :paid, total_cents: cents}}), do: "Pagato: #{cents} centesimi"
  def describe({:ok, %{status: status}}), do: "Stato: #{status}"
  def describe({:error, reason}), do: "Errore: #{inspect(reason)}"

  def gross(cents) when is_integer(cents) and cents >= 0 do
    div(cents * (100 + @vat_rate), 100)
  end
end

Shop.Pricing.describe({:ok, %{status: :paid, total_cents: 2599}})  # -> "Pagato: 2599 centesimi"
```

```elixir
order_id = 101
{:ok, ^order_id} = {:ok, 101}   # ^ (pin): confronta con il valore attuale invece di rilegare
[first | rest] = [:a, :b, :c]   # first = :a, rest = [:b, :c]
%{sku: sku} = %{sku: "MUG-2", qty: 2}  # le mappe matchano per sottoinsieme di chiavi
```

## Controllo di flusso

| Costrutto | Quando |
|---|---|
| `case value do pattern -> ... end` | scegliere in base alla forma di un valore |
| `cond do condizione -> ... end` | catena di condizioni booleane |
| `if` / `unless` | una sola condizione |
| `with` | concatenare passi che possono fallire (*happy path*) |

```elixir
# `with` prosegue finché ogni passo restituisce la forma attesa;
# al primo fallimento restituisce quel valore (es. {:error, :out_of_stock}).
def checkout(cart_id, payment) do
  with {:ok, cart} <- Carts.fetch(cart_id),
       :ok <- Inventory.reserve(cart.items),
       {:ok, charge} <- Payments.charge(payment, cart.total_cents) do
    {:ok, Orders.create(cart, charge)}
  end
end
```

Le funzioni con il **bang** (`File.read!/1`) lanciano un'eccezione invece di restituire `{:error, _}`: usale quando un errore è davvero inatteso.

## Collezioni: Enum e Stream

`Enum` è **eager** (calcola subito e crea liste intermedie); `Stream` è **lazy** (compone le trasformazioni ed elabora un elemento alla volta, utile per file grandi o sequenze infinite).

```elixir
orders = [
  %{id: 101, status: :paid, total_cents: 2598},
  %{id: 102, status: :pending, total_cents: 250},
  %{id: 103, status: :paid, total_cents: 4500}
]

orders
|> Enum.filter(&(&1.status == :paid))
|> Enum.map(& &1.total_cents)
|> Enum.sum()
# -> 7098

# Lazy: legge il CSV riga per riga senza caricarlo tutto in memoria.
"orders.csv"
|> File.stream!()
|> Stream.drop(1)
|> Stream.map(&String.trim/1)
|> Enum.take(10)
```

## Ricorsione

Non ci sono cicli `for` imperativi: si usa la ricorsione (o `Enum`). Con la **tail call optimization**, una chiamata ricorsiva in ultima posizione non fa crescere lo stack: per questo si usa un **accumulatore**.

```elixir
defmodule Shop.Stats do
  def paid_total(orders), do: paid_total(orders, 0)

  defp paid_total([], acc), do: acc
  defp paid_total([%{status: :paid, total_cents: c} | rest], acc), do: paid_total(rest, acc + c)
  defp paid_total([_ | rest], acc), do: paid_total(rest, acc)  # salta gli altri stati
end
```

## Struct, protocolli e behaviour

- Una **struct** è una mappa con campi fissi e un nome: chiavi sbagliate danno errore a compile time.
- Un **protocollo** è polimorfismo sul *tipo di dato* (come `String.Chars` per `to_string/1`).
- Un **behaviour** è un contratto di callback che un modulo promette di implementare (come `GenServer`).

```elixir
defmodule Shop.Order do
  @enforce_keys [:id, :customer_id]
  defstruct [:id, :customer_id, status: :pending, items: []]
end

defimpl String.Chars, for: Shop.Order do
  def to_string(order), do: "Ordine ##{order.id} (#{order.status})"
end

"#{%Shop.Order{id: 101, customer_id: 1}}"  # -> "Ordine #101 (pending)"
```

## Processi e messaggi

```elixir
parent = self()

pid = spawn(fn ->
  receive do
    {:price, sku} -> send(parent, {:price_of, sku, 1299})  # risponde al mittente
  end
end)

send(pid, {:price, "MUG-2"})

receive do
  {:price_of, sku, cents} -> IO.puts("#{sku}: #{cents}")
after
  1_000 -> IO.puts("timeout")  # mai attendere all'infinito
end
```

- Ogni processo ha una **mailbox**; `receive` estrae il primo messaggio che corrisponde a un pattern.
- **Link** (`spawn_link`): se uno dei due muore, muore anche l'altro. È il meccanismo su cui si basano i supervisor.
- **Monitor** (`Process.monitor`): ricevi un messaggio `:DOWN` quando il processo osservato muore, senza morire anche tu.

## OTP: GenServer e Supervisor

Un **GenServer** è un processo con stato e un'API: il client chiama funzioni normali, che mandano messaggi al processo.

```elixir
defmodule Shop.Inventory do
  use GenServer

  # API client: è eseguita nel processo del chiamante.
  def start_link(stock), do: GenServer.start_link(__MODULE__, stock, name: __MODULE__)
  def reserve(sku, qty), do: GenServer.call(__MODULE__, {:reserve, sku, qty})

  # Callback: eseguite nel processo del server, un messaggio alla volta (niente race condition).
  @impl true
  def init(stock), do: {:ok, stock}

  @impl true
  def handle_call({:reserve, sku, qty}, _from, stock) do
    case Map.get(stock, sku, 0) do
      available when available >= qty -> {:reply, :ok, Map.put(stock, sku, available - qty)}
      _ -> {:reply, {:error, :out_of_stock}, stock}
    end
  end
end
```

- `call` è **sincrono** (aspetta la risposta, timeout di default 5 s); `cast` è **asincrono** (nessuna risposta, nessuna backpressure).
- Il GenServer elabora un messaggio alla volta: è un modo semplice di serializzare l'accesso a uno stato, ma può diventare un collo di bottiglia.

```elixir
# In lib/shop/application.ex
children = [
  {Shop.Inventory, %{"MUG-2" => 10}},
  {Task.Supervisor, name: Shop.TaskSupervisor}
]
Supervisor.start_link(children, strategy: :one_for_one)
```

| Strategia | Se un figlio muore… |
|---|---|
| `:one_for_one` | riavvia solo quel figlio |
| `:one_for_all` | riavvia tutti i figli |
| `:rest_for_one` | riavvia quel figlio e quelli avviati dopo di lui |

Altri strumenti: **Task** (`Task.async/await`, `Task.async_stream` per lavoro parallelo con concorrenza limitata), **Agent** (stato semplice), **ETS** (tabelle in memoria condivise e molto veloci), **Registry** (nomi dinamici dei processi).

## Progetti e test

```bash
mix new shop --sup      # progetto con albero di supervisione
mix deps.get && mix test
iex -S mix              # shell interattiva con il progetto caricato
```

```elixir
defmodule Shop.PricingTest do
  use ExUnit.Case, async: true   # i test async girano in parallelo
  doctest Shop.Pricing           # esegue gli esempi `iex>` presenti nella documentazione

  test "applica l'IVA" do
    assert Shop.Pricing.gross(1000) == 1220
  end
end
```

**Phoenix** è il framework web di riferimento; **LiveView** costruisce UI interattive renderizzate dal server, con aggiornamenti via WebSocket e poco JavaScript.

## Per gli esercizi di coding

| Ti serve | Funzione |
|---|---|
| Frequenze | `Enum.frequencies(list)` · `Enum.frequencies_by(list, &f/1)` |
| Raggruppare | `Enum.group_by(orders, & &1.customer_id)` |
| Accumulare | `Enum.reduce(list, acc, fn x, acc -> ... end)` |
| Aggiornare una mappa | `Map.update(map, key, default, &(&1 + 1))` |
| Ordinare | `Enum.sort_by(orders, & &1.total_cents, :desc)` |
| Finestre e coppie | `Enum.chunk_every(list, 3, 1, :discard)` · `Enum.zip(a, b)` |
| Coda FIFO | `:queue.new()`, `:queue.in/2`, `:queue.out/1` |
| Indice | `Enum.with_index(list)` |
| Uscita anticipata | `Enum.reduce_while(list, acc, fn x, acc -> {:cont, acc} \| {:halt, acc} end)` |

- Le liste sono **concatenate**: `[x | list]` costa `O(1)`, `list ++ [x]` e `Enum.at(list, i)` costano `O(n)`. Costruisci la lista al contrario e chiama `Enum.reverse/1` alla fine.
- Per accessi casuali usa una mappa con indici come chiavi oppure una tupla (`elem/2` è `O(1)`).

## Domande da colloquio

**Base**
- **Cosa significa che `=` è un match?** Verifica che il lato destro corrisponda al pattern di sinistra e lega le variabili; se non corrisponde solleva `MatchError`.
- **Lista vs tupla?** La lista è concatenata (prepend `O(1)`, accesso `O(n)`), adatta a collezioni di dimensione variabile; la tupla è contigua (accesso `O(1)`), adatta a gruppi fissi come `{:ok, value}`.
- **A cosa serve la pipe?** Passa il risultato a sinistra come primo argomento della funzione a destra, rendendo leggibili le trasformazioni in sequenza.

**Intermedio**
- **Enum vs Stream?** Enum calcola subito e crea liste intermedie; Stream compone le operazioni in modo pigro e le esegue elemento per elemento solo alla fine.
- **Perché `{:ok, _}` / `{:error, _}` invece delle eccezioni?** Gli errori attesi diventano dati gestibili con pattern matching e `with`; le eccezioni restano per i bug e i casi imprevisti.
- **`call` vs `cast`?** `call` è sincrono e restituisce una risposta (offre backpressure); `cast` è fire-and-forget e rischia di riempire la mailbox se il server è lento.
- **Link vs monitor?** Il link è bidirezionale e propaga la morte (base della supervisione); il monitor è unidirezionale e notifica soltanto.
- **Come si accede al database?** Con **Ecto**: schema per mappare le tabelle, **changeset** per validare e tracciare le modifiche prima di scriverle, `Repo` per eseguire le query, query componibili con una sintassi simile a SQL.
- **Come è strutturata un'app Phoenix?** Endpoint → router → controller o LiveView, con la logica di dominio nei **context** (moduli come `Shop.Orders`), separati dal livello web.

**Avanzato**
- **Cosa significa "let it crash"?** Non scrivere codice difensivo per ogni errore imprevisto: lascia che il processo muoia e che il supervisor lo riavvii in uno stato noto. L'isolamento dei processi impedisce che il guasto si propaghi.
- **Perché la BEAM ha latenze prevedibili?** Lo scheduling è preemptive per riduzioni e il GC lavora per singolo processo, senza pause globali "stop the world".
- **Quando un GenServer è un collo di bottiglia?** Quando molti client lo chiamano: serializza tutto. Le soluzioni sono ETS per le letture concorrenti, il partizionamento in più processi o un pool.
- **Come funziona la TCO?** Se la chiamata ricorsiva è l'ultima operazione, il frame corrente viene riutilizzato: la ricorsione con accumulatore usa memoria costante.
- **Quali sono i limiti di prestazioni da tenere a mente?** Creare processi costa poco, ma i messaggi vengono copiati tra processi (i binari grandi no: sono condivisi tramite riferimento); il calcolo numerico intensivo è lento rispetto al codice nativo (si delega a NIF o Nx).

## Approfondisci

- [Elixir — Getting Started](https://hexdocs.pm/elixir/introduction.html)
- [GenServer](https://hexdocs.pm/elixir/GenServer.html) · [Supervisor](https://hexdocs.pm/elixir/Supervisor.html) · [Enum](https://hexdocs.pm/elixir/Enum.html)
- [Phoenix](https://hexdocs.pm/phoenix/overview.html)
