<!-- level: Introduzione -->
<!-- summary: Biologia da zero con analogie e limiti per chi arriva da informatica -->
# Prima di bioinformatica e biosecurity: dizionario per informatici

Non devi già sapere biologia.
Una cosa importante: le analogie con l'informatica aiutano a orientarsi, **ma non sono identità**; gli organismi viventi sono sistemi probabilistici, fisici ed evolutivi.

## La gerarchia di partenza

- **Cellula:** unità fondamentale capace di svolgere processi vitali.
- **DNA:** molecola che immagazzina informazione genetica (ma non determina ogni comportamento da sola).
- **Gene:** regione di DNA associata a prodotti funzionali, come RNA o proteine.
- **RNA:** famiglia di molecole con funzioni informative e regolatorie.
- **Proteina:** catena di aminoacidi che si ripiega e può svolgere funzioni cellulari.
- **Genoma:** complesso del materiale genetico di un organismo o campione.

## Dal campione al dataset

```text
Campione biologico (raccolto con protocolli appropriati)
    ↓
Misurazione / sequenziamento
    ↓
File grezzi + METADATI (origine, data, metodo, batch)
    ↓
Controllo qualità (QC)
    ↓
Tabella / matrice / sequenze
    ↓
Analisi statistica, bioinformatica o ML
    ↓
Interpretazione biologica con esperti del dominio
```

Il **batch** è un gruppo di misure ottenute in condizioni tecniche simili: può generare differenze apparenti che non dipendono dalla biologia.

## Come leggere una sequenza FASTA

```text
>campione_di_esempio
ACGTACGT
```

`>` segnala l'identificatore; la seconda riga contiene simboli che rappresentano basi del DNA.
Questa è una sequenza **sintetica**, non diagnostica.

## Non confondere i campi

- **Bioinformatica:** algoritmi per lavorare su dati biologici.
- **Biostatistica:** modelli quantitativi e incertezza su fenomeni biologici.
- **Epidemiologia:** distribuzione e determinanti di eventi di salute nelle popolazioni.
- **Biosafety:** prevenzione di esposizioni e rilasci accidentali.
- **Biosecurity:** prevenzione di accessi, sottrazioni e usi impropri.
- **Cyberbiosecurity:** protezione degli aspetti informatici di sistemi e infrastrutture biotecnologiche.

**Distinzione critica:** anomalie statistiche, associazioni e previsioni non equivalgono a diagnosi, causalità o conferma di un evento biologico.
