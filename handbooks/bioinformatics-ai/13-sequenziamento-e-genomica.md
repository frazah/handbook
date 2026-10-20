<!-- level: Bioinformatica -->
<!-- summary: Reads, copertura, riferimento, annotazione, varianti: il quadro generale -->
# Genomica e sequenziamento: la pipeline concettuale

Il **sequenziamento** fornisce informazioni sull'ordine di basi in frammenti di materiale genetico.  
Il sequenziatore non consegna necessariamente un genoma «pronto»: i suoi output devono essere interpretati con metodi computazionali.

## Prima del codice: cosa riconoscere

Sequenziamento = tecnica di misurazione; *read* = frammento letto; *reference genome* = sequenza di riferimento; *coverage* = quanta informazione copre certe posizioni. Un riferimento non coincide con ogni individuo.

```text
Letture → QC → analisi rispetto a riferimento / ricostruzione
        → annotazioni / varianti → controlli e interpretazione
```

Termini:

- **Read:** sequenza misurata dallo strumento.
- **Coverage/copertura:** misura di quanto una regione è rappresentata da letture; varia molto e non equivale da sola a qualità.
- **Riferimento:** sequenza utilizzata come base di confronto.
- **Assemblaggio:** ricostruzione di sequenze più lunghe a partire da frammenti.
- **Variant calling:** identificazione di potenziali differenze rispetto al riferimento.
- **Annotazione:** associazione di informazioni a regioni della sequenza.

## Applicazione innocua

Per studiare biodiversità vegetale in un dataset pubblico, potresti leggere cataloghi di sequenze, verificare specie, metadati e qualità e confrontare **statisticamente** campioni con metodi validati.  
Non serve svolgere alcun esperimento biologico.

**Trappole:** bias del riferimento, errori di lettura, contaminazioni, versioni di annotazione e interpretazione eccessiva di varianti.
