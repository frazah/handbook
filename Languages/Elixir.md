# Elixir — Cheatsheet

> **Quando serve:** servizi backend concorrenti, job asincroni, sistemi resilienti e applicazioni Phoenix. Elixir gira sulla VM **BEAM** (Erlang/OTP), non sulla JVM. Comincia con `iex` per provare i frammenti oppure salva il modulo in `orders.exs` ed esegui `elixir orders.exs`.

## Sintassi essenziale

| Vuoi fare | Sintassi | Significato |
|---|---|---|
| Assegnare un nome | `status = :paid` | il nome può essere *ribindato*, il valore non viene mutato |
| Atom | `:paid`, `:error` | valore simbolico, spesso stato/esito |
| Stringa | `"Ciao #{name}"` | interpolazione con `#{}` |
| Lista / tupla | `[1, 2]` / `{:ok, result}` | lista sequenziale / struttura a dimensione fissa |
| Mappa | `%{id: 7, status: :paid}` | chiavi e valori |
| Accesso mappa | `order.status`, `order[:status]` | il primo lancia se manca la chiave atomica; il secondo restituisce `nil` |
| Aggiornamento mappa | `%{order | status: :shipped}` | crea un valore nuovo; chiave già esistente obbligatoria |
| Pattern matching | `{:ok, order} = result` | estrae i valori e verifica la forma |
| Case | `case result do ... end` | ramificazione per pattern |
| Condizioni | `if`, `unless`, `cond` | rami booleani e più condizioni |
| Workflow fallibile | `with ... <- ... do ... else ... end` | concatena pattern `{:ok, ...}` |
| Gestire eccezioni | `try do ... rescue ... end` | eccezioni inattese, non sostituisce le tuple `{:error, ...}` |
| Funzione anonima | `fn order -> order.total_cents end` | funzione usata da `Enum` |
| Pipe | `orders |> Enum.filter(...)` | passa l'output come primo argomento della chiamata seguente |
| Modulo / funzione | `defmodule Orders do ... end` | funzioni pubbliche con `def`, private con `defp` |
| Guard | `when is_integer(qty) and qty > 0` | condizione limitata nella firma di una funzione |
| Eseguire test | `mix test` | test ExUnit di un progetto Mix |

**Leggi una firma:** `Orders.total_paid_cents/1` significa modulo `Orders`, funzione `total_paid_cents`, **1 argomento**. `=` serve anche al *pattern matching*: non è solo assegnazione. `nil` indica l'assenza di un valore; `false` e `nil` sono gli unici valori falsy.

## Ordini: dati immutabili, Enum e pattern matching

```elixir
# Salva come orders.exs. Importi interi in centesimi:
# evitiamo errori di arrotondamento con i float.
defmodule Orders do
  def paid_revenue(orders) do
    orders
    # La callback mantiene solo gli ordini effettivamente pagati.
    |> Enum.filter(fn order -> order.status == :paid end)
    # La seconda callback ricava un importo intero per ogni ordine.
    |> Enum.map(fn order -> order.total_cents end)
    # Somma gli importi selezionati; non modifica `orders`.
    |> Enum.sum()
  end

  def ship(order) do
    case order.status do
      :paid ->
        # La sintassi di update crea una nuova mappa.
        {:ok, %{order | status: :shipped}}

      :shipped ->
        {:error, :already_shipped}

      _ ->
        {:error, :payment_required}
    end
  end
end

orders = [
  %{id: 101, status: :paid, total_cents: 2599},
  %{id: 102, status: :pending, total_cents: 990},
  %{id: 103, status: :paid, total_cents: 1200}
]

IO.inspect(Orders.paid_revenue(orders), label: "Ricavi pagati in centesimi")
IO.inspect(Orders.ship(hd(orders)), label: "Spedizione")
```

Il risultato della spedizione è una **tupla tagged** (`{:ok, valore}` oppure `{:error, motivo}`): il chiamante può gestire esplicitamente entrambi i casi. `hd/1` prende il primo elemento; in codice applicativo su liste eventualmente vuote verifica prima l'input.

**Quando usare `Enum`/`Stream`:** `Enum` elabora la collezione subito e spesso crea liste intermedie. `Stream` consente trasformazioni *lazy* utili con input grandi o pipeline di più filtri. Non partire con ricorsione manuale se un'operazione di `Enum` esprime già bene il caso.

## Ricorsione e memoria: perché tail recursion?

Considera una lista di ordini da totalizzare. Elixir usa spesso la **ricorsione** al posto dei cicli con variabili mutate: il pattern `[order | rest]` separa il primo elemento dal resto della lista. Confrontiamo due modi per ottenere la stessa somma.

```elixir
defmodule Revenue do
  # Versione 1: la somma avviene DOPO la chiamata ricorsiva.
  def total([]), do: 0

  def total([order | rest]) do
    order.total_cents + total(rest)
  end

  # Versione 2: passiamo il totale parziale come accumulatore.
  def total_tail(orders), do: loop(orders, 0)

  defp loop([], accumulated), do: accumulated

  defp loop([order | rest], accumulated) do
    # Questa chiamata è l'ultima operazione della funzione.
    loop(rest, accumulated + order.total_cents)
  end
end

# Le due funzioni sommano tutti gli ordini ricevuti.
# Per conteggiare solo i pagati, filtrali prima:
paid_orders = Enum.filter(orders, fn order -> order.status == :paid end)

IO.inspect(Revenue.total(paid_orders))
IO.inspect(Revenue.total_tail(paid_orders))
```

**Immagina lo stack come una pila di promemoria.** Quando una funzione chiama sé stessa ma deve ancora effettuare un'operazione *dopo* il ritorno, il runtime deve ricordare dove riprendere. Nella prima versione ogni livello conserva un'addizione in sospeso; nella seconda il risultato parziale viene passato subito alla chiamata seguente.

**Traccia passo per passo.** Consideriamo soltanto i due ordini pagati dell'esempio, con importi di **2.599** e **1.200** centesimi. Nella traccia mostriamo solo gli importi per leggibilità: le funzioni sopra ricevono realmente mappe `order`.

```text
Ricorsione normale — il calcolo resta in sospeso:

total([2599, 1200]) = 2599 + total([1200])   ← attende il risultato
total([1200])       = 1200 + total([])       ← attende il risultato
total([])           = 0

Ritorno: 1200 + 0 = 1200
         2599 + 1200 = 3799

Tail recursion — il parziale viaggia nell'accumulatore:

loop([2599, 1200], 0)
loop([1200], 2599)
loop([], 3799)
→ 3799
```

Nella versione normale ogni chiamata deve conservare un'addizione in sospeso: per una lista di *n* elementi, lo spazio necessario per le chiamate cresce generalmente con *n*. Nella **tail recursion** la chiamata ricorsiva è l'ultima operazione: non resta lavoro da eseguire al ritorno. La **BEAM** applica la *tail-call optimization* (TCO), riutilizzando lo spazio delle chiamate invece di accumulare nuovi livelli di stack. **Non significa che l'algoritmo usi sempre memoria totale costante**: i dati elaborati possono comunque occupare spazio.

| Concetto | A cosa serve |
|---|---|
| **Stack** | Conserva le informazioni necessarie per riprendere una chiamata e i valori locali che servono ancora. |
| **Heap** | Contiene strutture dati come liste, tuple e mappe, che possono occupare memoria anche con tail recursion. |
| **Accumulatore** | È un normale valore passato tra chiamate, non un'area di memoria speciale. |
| **Garbage collector** | Recupera memoria di dati non più raggiungibili; nella BEAM la gestione è principalmente per processo. |

Sulla **BEAM ogni processo ha una propria area di memoria gestita**, che comprende stack e heap, oltre alla mailbox dei messaggi. La VM può condividere internamente alcune risorse, quindi questa tabella è un **modello concettuale per capire le chiamate**, non una descrizione precisa dei registri o di ogni dettaglio dell'allocazione. Una lista di risultati molto grande e una mailbox che cresce possono consumare molta memoria anche con uno stack stabile.

**Quando è utile e quando no?** Se costruisci una lista enorme o accumuli messaggi in una mailbox, la memoria totale può comunque crescere. Inoltre, fare `acc ++ [item]` ripetutamente copia parti della lista ed è spesso costoso: quando costruisci una lista ricorsivamente, in genere conviene `[item | acc]` e poi `Enum.reverse/1`. Nella maggior parte del codice applicativo scegli prima `Enum.map/2`, `Enum.reduce/3` o `Stream`: usa ricorsione manuale quando rende più chiaro l'algoritmo, e misura prima di ottimizzare.

Per approfondire il modello della VM: [Elixir — Recursion](https://elixir.hexdocs.pm/recursion.html), [Erlang — Tail recursion](https://www.erlang.org/doc/system/ref_man_functions.html) e [Erlang — Processes and memory](https://www.erlang.org/doc/system/eff_guide_processes.html).

## Un caso concreto di concorrenza: elaborare notifiche

```elixir
# Ogni job è indipendente e può eseguire I/O (es. chiamata HTTP).
# Qui usiamo un task di sola formattazione, sostituibile con un adapter reale.
notifications = [
  %{order_id: 101, email: "ada@example.test"},
  %{order_id: 103, email: "lin@example.test"}
]

results =
  notifications
  |> Task.async_stream(
    fn item ->
      # In produzione, il servizio email sta dietro un adapter con timeout/retry.
      {:prepared, item.order_id, item.email}
    end,
    max_concurrency: 4,
    timeout: 5_000,
    ordered: false
  )
  |> Enum.to_list()

IO.inspect(results)
```

`Task.async_stream/3` avvia attività concorrenti e restituisce risultati come `{:ok, value}` o `{:exit, reason}`: **devi gestire i fallimenti**. Per processi di lunga durata o con stato condiviso per messaggi, studia `GenServer` e *Supervisor* (OTP); i processi BEAM non equivalgono a thread OS e comunicano principalmente tramite messaggi.

## Control flow, collezioni e modelli dati

In Elixir `if`, `case`, `cond` e `with` sono **espressioni**: producono un valore. `if` è comodo con un booleano; `case` sceglie in base al pattern; `cond` valuta più condizioni; `with` concatena operazioni che possono restituire `{:ok, valore}` o `{:error, motivo}`.

```elixir
order = %{id: 101, status: :paid, total_cents: 2599}

# `^` impedisce il re-binding: confronta col valore già assegnato.
expected_id = 101
%{id: ^expected_id, status: status} = order

shipping_label =
  cond do
    status == :paid -> "Ready to ship"
    status == :cancelled -> "Do not ship"
    true -> "Needs review"
  end

# Le keyword list sono liste di coppie, spesso opzioni di funzione.
opts = [timeout: 5_000, retry: false]
IO.inspect(Keyword.get(opts, :timeout))

# `&` cattura una funzione: forma breve di una callback.
order_ids = Enum.map([order], & &1.id)
IO.inspect(order_ids)

# for = comprehension; filtra e trasforma in un solo passaggio.
paid_ids = for item <- [order], item.status == :paid, do: item.id
IO.inspect(paid_ids)
```

**`with` in un vero workflow:** separa validazione e recupero; il ramo `else` gestisce l'errore lasciando intatti gli `{:error, motivo}`.

```elixir
defmodule Checkout do
  def confirm(order, orders) do
    with :ok <- validate_order(order),
         {:ok, paid_order} <- find_paid_order(order.id, orders) do
      {:ok, %{paid_order | status: :confirmed}}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp validate_order(%{id: id}) when is_integer(id) and id > 0, do: :ok
  defp validate_order(_), do: {:error, :invalid_order}

  defp find_paid_order(id, orders) do
    case Enum.find(orders, fn item -> item.id == id and item.status == :paid end) do
      nil -> {:error, :not_paid}
      paid -> {:ok, paid}
    end
  end
end
```

`struct` è una mappa con campi dichiarati, utile a rappresentare contratti interni. `MapSet` evita duplicati. `Enum.reduce` produce un accumulatore; `Stream` evita di materializzare ogni trasformazione intermedia. Le `@spec` descrivono contratti per strumenti statici come Dialyzer, **non** validano argomenti a runtime.

```elixir
defmodule Catalog.Product do
  @enforce_keys [:sku, :price_cents]
  defstruct [:sku, :price_cents, available: true]

  @type t :: %__MODULE__{
    sku: String.t(),
    price_cents: non_neg_integer(),
    available: boolean()
  }

  @spec inventory_value(t(), non_neg_integer()) :: non_neg_integer()
  def inventory_value(product, quantity), do: product.price_cents * quantity
end
```

## Processi BEAM e OTP: l'essenziale

Ogni processo BEAM ha un proprio stato e una **mailbox**; i messaggi vengono copiati o condivisi dal runtime secondo il dato e l'implementazione, ma non mutano lo stato dell'altro processo. `send/2` invia un messaggio senza aspettare; `receive` estrae un messaggio che corrisponde a un pattern. I processi sono **leggeri**, ma non gratuiti: troppi processi, mailbox non svuotate o task senza limiti possono consumare memoria.

```elixir
parent = self()

pid = spawn(fn ->
  receive do
    {:calculate_shipping, cents} ->
      send(parent, {:shipping_quote, cents + 499})
  after
    1_000 -> send(parent, {:error, :timeout})
  end
end)

send(pid, {:calculate_shipping, 2000})

receive do
  {:shipping_quote, price} -> IO.inspect(price, label: "Quote")
  {:error, reason} -> IO.inspect(reason, label: "Error")
after
  1_500 -> IO.puts("Service unavailable")
end
```

Per **stato duraturo** usa `GenServer` con `init/1`, `handle_call/3` (richiesta/risposta) e `handle_cast/2` (messaggio asincrono); per evitare processi orfani avviali sotto una **Supervisor**. Supervision non significa che ogni operazione venga ritentata in sicurezza: serve idempotenza per pagamenti, email e scritture esterne. Phoenix ed Ecto sono stack diffusi rispettivamente per web e persistenza, non parte della sintassi di base.

```elixir
# In un progetto Mix: questo modulo è un processo supervisionato.
defmodule InventoryCache do
  use GenServer

  # Stato: mappa sku => quantità disponibile, aggiornato serialmente.
  def start_link(initial_stock) do
    GenServer.start_link(__MODULE__, initial_stock, name: __MODULE__)
  end

  def reserve(sku, quantity) when is_integer(quantity) and quantity > 0 do
    GenServer.call(__MODULE__, {:reserve, sku, quantity})
  end

  @impl true
  def init(initial_stock), do: {:ok, initial_stock}

  @impl true
  def handle_call({:reserve, sku, quantity}, _from, stock) do
    available = Map.get(stock, sku, 0)

    if available >= quantity do
      updated = Map.put(stock, sku, available - quantity)
      {:reply, :ok, updated}
    else
      {:reply, {:error, :insufficient_stock}, stock}
    end
  end
end

# In Application/Supervisor: children = [{InventoryCache, %{"BOOK-1" => 5}}]
# Poi InventoryCache.reserve("BOOK-1", 2) -> :ok
```

Questo è uno **stato in memoria su un solo processo**, adatto a prototipi o cache locali: per scorte reali su più istanze servono database, transazioni e persistenza. In produzione aggiungi timeout, limiti, test ExUnit e supervision tree coerente con il dominio. Per approfondire OTP, vedi [GenServer](https://hexdocs.pm/elixir/GenServer.html) e [Supervisor](https://hexdocs.pm/elixir/Supervisor.html).

## Pronto per progetti e colloqui

- **Installazione e workflow:** `elixir --version`, `iex`, `mix new shop`, `mix test`, `mix format`.
- **`Enum` vs `Stream`?** Operazioni immediate vs pipeline lazy; misura prestazioni e memoria prima di ottimizzare.
- **Immutabilità?** Modificare una mappa/liste produce nuovi valori, utile per prevedibilità e concorrenza. Il runtime può condividere memoria internamente.
- **Pattern matching?** Verifica la forma di un valore ed estrae dati: utilissimo per `{:ok, x}` / `{:error, why}`.
- **`GenServer` e Supervisor?** Processo con callbacks e stato gestito tramite messaggi; supervisor monitora e riavvia processi secondo una strategia.
- **Tail vs non-tail recursion?** Se la chiamata ricorsiva è l'ultima operazione, la BEAM può evitare la crescita dello stack a ogni livello.

**Approfondisci quando serve:** [Elixir: guida introduttiva](https://elixir.hexdocs.pm/introduction.html), [Enum e Stream](https://elixir.hexdocs.pm/enumerable-and-streams.html), [GenServer](https://hexdocs.pm/elixir/GenServer.html), [Mix/OTP](https://elixir.hexdocs.pm/introduction-to-mix.html). Questi riferimenti sono migliori di aggiungere altri dieci capitoli di teoria alla cheatsheet.
