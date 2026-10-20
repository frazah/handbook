# React — Esercizi progressivi

1. **JSX:** crea `ProductCard` con nome e prezzo ricevuti in props. Usa `type ProductCardProps` esterno alla funzione.
2. **Destructuring:** riscrivi lo stesso componente prima con `props.name` e poi con `{ name }: ProductCardProps`. Spiega la differenza.
3. **Callback:** crea un `BuyButton` che riceve `onBuy: (id: string) => void`. Fai chiamare `onBuy` **solo** durante il click.
4. **Liste:** visualizza 3 prodotti con `.map()` multilinea e `key` basata su ID.
5. **Stato:** aggiungi `useState` per un contatore e usa sempre `setCount(previous => previous + 1)` negli incrementi.
6. **Form:** implementa `AddTask` con input controllato, `preventDefault`, `trim` e callback `onAdd`.
7. **Composizione:** usa `App` per conservare la lista di task e passarla a `TaskList`; rimuovi duplicazioni di stato.
8. **Reducer:** implementa azioni `add`, `toggle` e `remove` senza mutare l'array.
9. **Rete:** carica `/api/tasks` con loading/error, annulla la richiesta nel cleanup e valida i dati ricevuti.
10. **Test:** verifica da DOM che una task venga mostrata e che il pulsante esegua la callback.

**Autocontrollo:** prima di comprimere un esempio, dovresti saper spiegare separatamente il tipo delle props, la funzione callback e il JSX.
