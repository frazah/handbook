<!-- level: Bioinformatica -->
<!-- summary: FASTA, FASTQ, BAM, VCF, annotazioni e metadati -->
# I formati che incontrerai

| Formato | Che cosa descrive | Nota |
| --- | --- | --- |
| FASTA | Una o più sequenze con identificatore | Non contiene qualità per base |
| FASTQ | Sequenze lette con valori qualità | Comune nei dati di sequenziamento |
| SAM/BAM/CRAM | Letture allineate e relativi metadati | SAM testo, BAM binario compresso |
| VCF | Varianti rispetto a un riferimento | Richiede interpretazione contestuale |
| GFF/GTF | Annotazioni di regioni genomiche | Coordinate e tipo di feature |
| CSV/TSV | Matrici di abbondanza e metadati | Semplici ma soggetti a errori |
| PDB/mmCIF | Strutture macromolecolari 3D | Coordinate atomiche e annotazioni |

## Mini-FASTA inventato

## Prima del codice: cosa riconoscere

FASTA contiene sequenze con identificatori; FASTQ aggiunge misure di qualità delle basi. BAM/CRAM, VCF e GFF/GTF codificano informazioni diverse e non sono intercambiabili.

```fasta
>pianta-demo-01
ACGTACGTAA
>pianta-demo-02
ACGTTCGTAA
```

Il testo dopo `>` è un **identificatore**, non è parte della sequenza.  
Il significato delle lettere e delle coordinate dipende dall'alfabeto e dallo standard.

**Metadati fondamentali:** identità del campione (anonimizzata quando richiesto), organismo, condizioni, metodo di misura, batch, unità, versione del riferimento, data e provenienza.

**Errore tipico:** confrontare coordinate di genomi o trascritti di versioni diverse senza verificarle.
**Altro errore:** trattare FASTQ e FASTA come equivalenti: il primo porta informazioni sulla qualità delle letture.

Riferimento: [NCBI Sequence Read Archive](https://www.ncbi.nlm.nih.gov/sra/docs/submitformats/).
