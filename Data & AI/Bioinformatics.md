# Bioinformatica

> Biologia, formati e algoritmi essenziali per un informatico senza studi biologici che si prepara a un ruolo in bioinformatica o AI for biology. Solo concetti e analisi di dati: nessuna procedura di laboratorio.
> Collegate: [Python](../Languages/Python.md) · [Pattern algoritmici](../Fundamentals/Pattern%20algoritmici.md#programmazione-dinamica) · [Data Science](Data%20Science.md)

## Modello mentale

- Il **DNA** è una sequenza su un alfabeto di 4 basi (`A`, `C`, `G`, `T`), a doppio filamento: `A` si appaia con `T`, `C` con `G`. Un filamento si legge nella direzione 5'→3'.
- **Dogma centrale (semplificato):** DNA → (trascrizione) → RNA → (traduzione) → proteina. Ogni tripletta di basi (**codone**) codifica un amminoacido. Esistono molte eccezioni e regolazioni.
- Un **genoma** è l'intero DNA di un organismo; un **gene** è una regione che produce un prodotto funzionale; una **variante** è una differenza rispetto a un genoma di riferimento (non necessariamente dannosa).
- I sequenziatori non leggono un genoma intero: producono milioni di **read** (frammenti corti con errori) che vanno **allineati** a un riferimento o **assemblati**.
- Gran parte del lavoro è **ingegneria dei dati**: file enormi, formati standard, pipeline riproducibili, controllo qualità.
- I dati biologici sono rumorosi e pieni di confondenti (lotto di laboratorio, strumento, paziente): la metodologia conta più del modello.

## Sintassi al volo

### Glossario per informatici

| Termine | In parole semplici |
|---|---|
| Base / nucleotide | carattere dell'alfabeto `ACGT` (`U` al posto di `T` nell'RNA) |
| Complemento inverso | il filamento opposto letto nella sua direzione: `ATGC` → `GCAT` |
| Read | frammento sequenziato (50–300 basi per short read, migliaia per long read) |
| Copertura (coverage) | quante read coprono in media ogni posizione |
| Allineamento | posizionare una read sul riferimento, tollerando differenze |
| SNP / indel | variante di una base / inserzione o delezione |
| Espressione genica | quanto un gene è "attivo" (quantità di RNA prodotto) |
| Proteina | catena di amminoacidi (alfabeto di 20 lettere) che si ripiega in una struttura 3D |

### Formati

| Formato | Contenuto | Nota |
|---|---|---|
| **FASTA** | `>id descrizione` + sequenza | sequenze di riferimento |
| **FASTQ** | 4 righe per read: `@id`, sequenza, `+`, qualità | output del sequenziatore |
| **SAM / BAM** | read allineate (BAM = binario compresso e indicizzato) | output dell'allineatore |
| **VCF** | varianti: cromosoma, posizione, riferimento, alternativa, qualità | 1-based |
| **GFF / GTF** | annotazioni: geni, esoni, coordinate | 1-based, estremi inclusi |
| **BED** | intervalli genomici | **0-based**, fine esclusa (come gli slice Python) |

Le coordinate 0-based vs 1-based sono la fonte di bug *off-by-one* più comune: BED `chr1 0 100` e GFF `chr1 1 100` indicano le stesse 100 basi.

La qualità FASTQ è in **scala Phred**: `Q = -10·log10(p_errore)`, codificata come carattere ASCII `chr(Q + 33)`. Q30 = 1 errore su 1000.

## Leggere FASTA e FASTQ

In produzione si usano librerie come **Biopython** o **pysam**; scritti a mano mostrano il formato.

```python
from collections.abc import Iterator

def parse_fasta(text: str) -> Iterator[tuple[str, str]]:
    header, chunks = None, []
    for line in text.splitlines():
        if line.startswith(">"):
            if header is not None:
                yield header, "".join(chunks)
            header, chunks = line[1:].split()[0], []  # id = primo campo dopo ">"
        elif line.strip():
            chunks.append(line.strip().upper())        # le sequenze vanno a capo su più righe
    if header is not None:
        yield header, "".join(chunks)

fasta = ">sample_A sintetico\nACGTACGTNA\nCGT\n>sample_B\nCCGTAAGT\n"
assert dict(parse_fasta(fasta)) == {"sample_A": "ACGTACGTNACGT", "sample_B": "CCGTAAGT"}
```

```python
def mean_phred(quality: str) -> float:
    return sum(ord(c) - 33 for c in quality) / len(quality)

read = ["@read_1", "ACGTTGCA", "+", "IIIIII#!"]  # 'I' = Q40, '#' = Q2, '!' = Q0
assert round(mean_phred(read[3]), 2) == 30.25
# QC tipico: scartare o accorciare (trimming) le read con qualità bassa in coda.
```

## Algoritmi sulle sequenze

```python
COMPLEMENT = str.maketrans("ACGT", "TGCA")

def reverse_complement(seq: str) -> str:
    return seq.translate(COMPLEMENT)[::-1]

def gc_content(seq: str) -> float:
    canonical = sum(seq.count(b) for b in "ACGT")  # esclude le basi ambigue (N)
    return (seq.count("G") + seq.count("C")) / canonical if canonical else 0.0

def kmer_counts(seq: str, k: int) -> dict[str, int]:
    counts: dict[str, int] = {}
    for i in range(len(seq) - k + 1):  # finestra scorrevole di lunghezza k
        kmer = seq[i:i + k]
        counts[kmer] = counts.get(kmer, 0) + 1
    return counts

def hamming(a: str, b: str) -> int:
    if len(a) != len(b):
        raise ValueError("Hamming richiede sequenze della stessa lunghezza")
    return sum(x != y for x, y in zip(a, b))

assert reverse_complement("ATGC") == "GCAT"
assert gc_content("GGCCATNN") == 4 / 6
assert kmer_counts("ATATA", 2) == {"AT": 2, "TA": 2}
assert hamming("ACGT", "ACCT") == 1
```

I **k-mer** sono alla base di molti strumenti: indicizzazione per l'allineamento, assemblaggio (grafi di de Bruijn), confronto rapido tra genomi, feature per modelli ML.

### Allineamento globale (Needleman-Wunsch)

È programmazione dinamica su due stringhe, come l'edit distance: `dp[i][j]` = miglior punteggio allineando i primi `i` caratteri di `a` e i primi `j` di `b`.

```python
def global_alignment_score(a: str, b: str, match=1, mismatch=-1, gap=-2) -> int:
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        dp[i][0] = i * gap          # a[:i] allineato contro soli gap
    for j in range(1, len(b) + 1):
        dp[0][j] = j * gap
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            diag = dp[i - 1][j - 1] + (match if a[i - 1] == b[j - 1] else mismatch)
            dp[i][j] = max(diag, dp[i - 1][j] + gap, dp[i][j - 1] + gap)
    return dp[-1][-1]

assert global_alignment_score("GATTACA", "GATCA") == 1  # 5 match, 2 gap
```

- Costo `O(n·m)` in tempo e memoria: impraticabile per allineare milioni di read su un genoma di miliardi di basi.
- **Smith-Waterman** è la variante *locale* (miglior sotto-regione; i punteggi negativi si azzerano).
- **BLAST** e gli allineatori di read (BWA, minimap2) usano euristiche **seed-and-extend**: trovano corrispondenze esatte corte (seed, tramite indici di k-mer o FM-index) e solo attorno a quelle estendono con la DP. Rinunciano all'ottimo garantito in cambio di velocità.

## Pipeline di sequenziamento

Una tipica analisi di varianti (*variant calling*):

1. **QC** delle read grezze (FastQC) e trimming di adattatori e code a bassa qualità.
2. **Allineamento** al genoma di riferimento (BWA-MEM, minimap2) → BAM ordinato e indicizzato.
3. Rimozione dei **duplicati** di PCR, statistiche di copertura.
4. **Variant calling** (GATK, bcftools, DeepVariant) → VCF.
5. **Filtro e annotazione** delle varianti (effetto sui geni, frequenza nella popolazione).

**Riproducibilità:** workflow manager (**Snakemake**, **Nextflow**) che descrivono i passi come un DAG, con versioni fissate degli strumenti (conda, container) e la versione del genoma di riferimento registrata (GRCh37 e GRCh38 hanno coordinate diverse).

## Omics e machine learning

- **Matrice di espressione:** righe = campioni, colonne = geni (decine di migliaia). Tipicamente **p ≫ n** (molte più feature che campioni): alto rischio di overfitting, servono regolarizzazione e riduzione dimensionale (PCA).
- **Normalizzazione:** i conteggi dipendono dalla profondità di sequenziamento; si normalizza prima di confrontare campioni (CPM/TPM, metodi di DESeq2).
- **Batch effect:** differenze tecniche (giorno, laboratorio, strumento) che possono superare quelle biologiche. Se i casi sono tutti in un lotto e i controlli in un altro, il modello impara il lotto.
- **Leakage:** split per **paziente**, non per campione: campioni dello stesso paziente in train e test gonfiano le metriche. Lo stesso vale per proteine molto simili tra train e test.
- **Struttura delle proteine:** AlphaFold predice la struttura 3D dalla sequenza di amminoacidi; i **protein language model** (es. ESM) imparano rappresentazioni dalle sequenze come gli LLM dal testo, e si usano come feature per predire funzione o stabilità.
- **Banche dati pubbliche:** NCBI (GenBank, SRA), Ensembl (genomi annotati), UniProt (proteine), PDB (strutture).

## Biosafety, biosecurity e responsabilità

- **Biosafety:** proteggere persone e ambiente dall'esposizione accidentale ad agenti biologici (contenimento, livelli di sicurezza dei laboratori).
- **Biosecurity:** prevenire l'uso improprio intenzionale di materiali, dati e conoscenze biologiche.
- **Dual use:** strumenti e conoscenze utili alla medicina possono essere abusati. Per questo la sintesi di DNA prevede lo **screening delle sequenze** ordinate, e i modelli di AI per la biologia vengono valutati per capacità rischiose prima del rilascio.
- **Privacy genomica:** il DNA identifica una persona e i suoi parenti e non si può "cambiare" come una password. Richiede consenso informato, accesso controllato, minimizzazione dei dati e conformità normativa (GDPR: dati sanitari e genetici sono categorie particolari).

## Domande da colloquio

**Base**
- **FASTA vs FASTQ?** FASTA contiene solo identificatori e sequenze; FASTQ aggiunge per ogni base un punteggio di qualità Phred, ed è l'output tipico del sequenziamento.
- **Cos'è il complemento inverso e perché serve?** È la sequenza del filamento opposto letta nella sua direzione 5'→3'. Una read può provenire da entrambi i filamenti, quindi gli allineatori cercano entrambe le orientazioni.
- **0-based o 1-based?** BED (e Python) usano 0-based con fine esclusa; VCF, GFF e SAM usano 1-based con estremi inclusi. Confonderli sposta tutto di una posizione.

**Intermedio**
- **Perché non si usa Needleman-Wunsch per allineare le read?** Costa `O(n·m)`: con milioni di read e un genoma di miliardi di basi è impraticabile. Si usano indici (k-mer, FM-index) e seed-and-extend, applicando la DP solo su piccole regioni.
- **Cos'è la copertura e perché conta?** Il numero medio di read per posizione. Con copertura bassa non si distingue una variante vera da un errore di sequenziamento.
- **Cos'è un batch effect?** Una variazione tecnica sistematica tra lotti. Si previene con un disegno sperimentale bilanciato e si corregge con metodi specifici; altrimenti i modelli imparano il lotto invece della biologia.

**Avanzato**
- **Come eviti il leakage in un modello su dati di pazienti?** Split per paziente (e per centro, se serve generalizzare), normalizzazione e selezione delle feature dentro la cross-validation, verifica su una coorte esterna.
- **Come rendi riproducibile una pipeline?** Workflow manager con DAG esplicito, versioni fissate di strumenti e riferimenti, container, parametri e checksum registrati, dati grezzi immutabili.
- **Perché i dati genomici richiedono tutele particolari?** Sono identificativi in modo permanente, rivelano informazioni anche sui familiari e possono essere re-identificati incrociando banche dati pubbliche.

## Approfondisci

- [Rosalind](https://rosalind.info/problems/list-view/) — esercizi di bioinformatica in stile coding
- [Biopython Tutorial](https://biopython.org/docs/latest/Tutorial/) · [SAM/BAM e VCF specs](https://samtools.github.io/hts-specs/)
- [Snakemake](https://snakemake.readthedocs.io/) · [nf-core (pipeline Nextflow)](https://nf-co.re/)
