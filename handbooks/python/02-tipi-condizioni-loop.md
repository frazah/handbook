# Valori, tipi, condizioni e cicli

**Idea.** Python è tipizzato dinamicamente, ma i valori hanno comunque tipi; l'annotazione `: int` documenta e aiuta il type checker, **non forza** conversioni runtime.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
customer = "Luca"
quantity: int = 3
price = 14.90
active = True
coupon = None               # assenza di valore

if active and quantity >= 2:
    print(f"Totale: {quantity * price:.2f} €")
elif not active:
    print("Account inattivo")
else:
    print("Ordine piccolo")

for index, item in enumerate(["mouse", "monitor"], start=1):
    print(index, item)

attempts = 0
while attempts < 3:
    attempts += 1
```

**Operatori:** `==` confronta valori, `is` confronta identità (usalo in particolare per `is None`); `and`/`or` possono restituire un operando, non per forza `bool`.  
Le stringhe e liste vuote sono *falsy*.

**Errore comune:** `if value:` confonde `0`, `""`, `[]` e `None`: usa `is None` quando devi distinguerli.
