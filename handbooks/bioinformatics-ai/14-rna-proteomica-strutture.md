<!-- level: Bioinformatica -->
<!-- summary: RNA-seq, single-cell, proteine e strutture 3D -->
# Espressione genica, proteomica e strutture 3D
## Prima del codice: cosa riconoscere

RNA-seq misura segnali legati all’espressione, proteomica studia proteine/peptidi, strutture 3D descrivono configurazioni molecolari. Sono strati diversi, non surrogati equivalenti.


**RNA-seq:** misura, attraverso sequenziamento, frammenti di RNA presenti in un campione e permette di stimare livelli di espressione.  
Una matrice comune è `campioni × geni` oppure `cellule × geni`.

| Approccio | Informazione | Insidia |
| --- | --- | --- |
| Bulk RNA-seq | Segnale medio del campione | Mix di tipi cellulari |
| Single-cell RNA-seq | Segnale a livello di singola cellula | Sparsità, dropout e qualità |
| Proteomica | Presenza/abbondanza/proprietà di proteine | Tecniche e copertura differiscono |
| Strutture proteiche | Geometria tridimensionale osservata o predetta | Geometria ≠ funzione dimostrata |

## Caso pratico

Se un gene è più espresso in un gruppo, il perché potrebbe essere biologico, **oppure** dipendere da una diversa proporzione di tipi cellulari o da un batch.  
Prima del grafico differenziale servono buoni metadati e normalizzazioni adatte.

**Struttura 3D:** il ripiegamento di una proteina influenza funzione e interazioni.  
Le predizioni computazionali (inclusi sistemi AI) sono strumenti potentissimi, ma rimangono predizioni: occorrono verifiche e attenzione agli intervalli di confidenza.

Esplora [UniProt](https://www.uniprot.org/) e [RCSB PDB](https://www.rcsb.org/).
