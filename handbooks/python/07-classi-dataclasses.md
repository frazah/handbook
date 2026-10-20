# Classi, dataclass e typing

**Idea.** Usa una classe quando dati e comportamento formano un'entità; una `dataclass` genera automaticamente metodi come `__init__` e `__repr__`.

**Prima di leggere il codice — simboli e termini:**

- **`def`**: dichiara una funzione, cioè un blocco riutilizzabile di operazioni.
- **`->`**: annotazione di tipo del risultato: Python non la impone a runtime.
- **`@decorator`**: sintassi che applica una funzione/classe decoratrice a una definizione.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from dataclasses import dataclass, field

@dataclass
class Cart:
    customer_id: str
    items: list[float] = field(default_factory=list)

    def add(self, price: float) -> None:
        if price < 0:
            raise ValueError("Prezzo negativo")
        self.items.append(price)

    @property
    def total(self) -> float:
        return round(sum(self.items), 2)

cart = Cart("u42")
cart.add(19.90)
print(cart.total)
```

**Typing:** `list[str]`, `dict[str, int]`, `int | None` descrivono forme attese.  
Usa `mypy`/`pyright` per il controllo statico, non sono validator runtime automatici.

**Errore comune:** `items: list = []` in una dataclass; usa `field(default_factory=list)` per istanze indipendenti.
