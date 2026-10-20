<!-- level: Esplorazione -->
<!-- summary: Scegliere grafici leggibili e non fuorvianti con matplotlib -->
# Grafici: raccontare i dati senza distorcerli

| Domanda | Grafico |
|---|---|
| Come cambia nel tempo? | Linea |
| Quali categorie pesano di più? | Barre ordinate |
| Com'è distribuita una variabile? | Istogramma o boxplot |
| Due variabili sono associate? | Scatter plot |

## Prima del codice: cosa riconoscere

La scelta del grafico dipende dalla domanda: linee per evoluzione temporale, barre per categorie, scatter per relazioni fra variabili. Controlla assi, unità, aggregazioni e outlier.

```python
import matplotlib.pyplot as plt

categories = ["Tech", "Books", "Home"]
revenues = [1220, 850, 430]
fig, ax = plt.subplots(figsize=(7, 4))
ax.bar(categories, revenues)
ax.set(title="Fatturato per categoria", ylabel="Euro")
ax.set_ylim(bottom=0)          # barre da zero: confronto non distorto
fig.tight_layout()
fig.savefig("revenue-by-category.png", dpi=160)
plt.close(fig)
```

## Buone abitudini

- Metti unità, periodo e definizioni della metrica.
- Ordina categorie secondo il messaggio, non alfabeticamente per forza.
- Evita grafici 3D decorativi e doppi assi fuorvianti.
- Per dati nel tempo, considera stagionalità e trend.
- Non confondere correlazione con causalità.

**Esempio reale:** se le vendite cambiano perché le visite cambiano, mostra anche il **tasso di conversione**, non solo gli ordini.
