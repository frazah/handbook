# Bioinformatics, AI & Biosecurity — Cheatsheet

> **Per informatici senza studi biologici:** una mappa per capire concetti e formati principali, collegarli ad analisi dati/AI e distinguere prevenzione, biosafety e biosecurity. Non è una guida diagnostica o di laboratorio.

## Overview: biologia da zero

| Termine | In parole semplici | Analogia informatica (non letterale) |
|---|---|---|
| **Cellula** | unità funzionale della vita | sistema operativo complesso |
| **DNA** | molecola che conserva informazione genetica | archivio persistente |
| **Gene** | regione di DNA associata a prodotti funzionali | modulo |
| **RNA** | molecole con ruoli nella produzione/regolazione | messaggi/intermedi |
| **Proteina** | molecola che svolge funzioni biologiche | componente operativo |
| **Genoma** | insieme del materiale genetico | intero dataset |
| **Variante** | differenza di sequenza rispetto a riferimento | differenza, non automaticamente errore |
| **Espressione genica** | attività/abbondanza dei prodotti genici | telemetria contestuale |
| **Patogeno** | organismo/agente che può causare malattia | nessuna analogia semplice |

**DNA → RNA → proteina** è una semplificazione utile del flusso di informazione genetica, non una regola senza eccezioni. Una proteina è una catena di amminoacidi; la sua struttura influenza il comportamento. *Genotipo* riguarda informazioni genetiche, *fenotipo* caratteristiche osservabili, influenzate anche dall'ambiente.

## Formati e sintassi essenziali

| Formato / dato | Cosa contiene | Usato per |
|---|---|---|
| **FASTA** | identificatore `>` + sequenza | sequenze DNA/RNA/proteine |
| **FASTQ** | letture di sequenziamento + qualità | sequenziamento grezzo |
| **VCF** | varianti rispetto a un riferimento | analisi genomica |
| **GFF/GTF** | annotazioni su coordinate del genoma | geni e trascritti |
| **CSV/TSV** | tabelle di misure/metadati | dati sperimentali |
| **PDB/mmCIF** | struttura molecolare tridimensionale | analisi proteine |

```text
>sequence_1
ATGCGTAA
>sequence_2
ATACGTAA
```

Le stringhe biologiche sono **dati**, non parole arbitrarie: il riferimento, l'orientamento, la qualità delle misure e i metadati determinano come interpretarle.

## Concetti applicati

### Sequenze e analisi (esempio innocuo)

```python
# Esempio di QC su un vero formato FASTA, usando Biopython.
# Installazione: python3 -m pip install biopython
from Bio import SeqIO

# Il file può provenire da un laboratorio o repository, con metadati verificati.
# Il codice presuppone il file `samples.fasta` presente nella stessa cartella.
for record in SeqIO.parse('samples.fasta', 'fasta'):
    sequence = str(record.seq).upper()

    # Non trattare basi ambigue (N) come A/C/G/T nel denominatore.
    standard_bases = sum(sequence.count(base) for base in 'ACGT')
    if standard_bases == 0:
        print(record.id, 'Nessuna base canonica disponibile')
        continue

    gc_count = sequence.count('G') + sequence.count('C')
    gc_fraction = gc_count / standard_bases
    print(record.id, f'GC (basi canoniche): {gc_fraction:.1%}')
```

Per provarlo con dati artificiali innocui, crea `samples.fasta`:

```fasta
>sample_A
ACGTACGTNACGT
>sample_B
CCGTAAGT
```

**Attenzione:** l'esempio misura solo una statistica composizionale: non certifica la qualità delle letture e non valida diagnosi, gene o funzione. Per FASTQ controlla anche le qualità base-per-base; per pipeline vere usa procedure con provenienza e versioni documentate.

Confrontare sequenze richiede spesso **allineamento**, gestione di inserzioni/delezioni e conoscenza della qualità/costruzione del dataset. Somiglianza di sequenza non prova da sola equivalenza funzionale.

### Omics e AI

- **Genomica:** informazione DNA/genoma e varianti.
- **Trascrittomica:** RNA/espressione genica, spesso alta dimensionalità.
- **Proteomica:** proteine, abbondanze e modificazioni.
- **Metabolomica:** molecole/metaboliti e processi metabolici.
- **Systems biology:** reti e interazioni fra componenti biologiche, non solo singoli geni.
- **AI:** classificazione di campioni, analisi di immagini, modelli di sequenze o struttura; servono dataset e validazioni appropriate.

Rischi tipici del ML biomedico: *data leakage* (campioni dello stesso paziente in train/test), batch effects (laboratori/protocolli), dataset sbilanciati, confondenti, generalizzazione fra popolazioni e interpretazioni causali scorrette.

### Epidemiologia e prevenzione

- **Incidenza:** nuovi casi in un periodo/popolazione definita.
- **Prevalenza:** casi presenti in un dato momento/periodo.
- **Sensibilità:** quota di positivi veri identificati da un test.
- **Specificità:** quota di negativi veri correttamente identificati.
- **Sorveglianza:** raccolta e analisi sistematiche per orientare decisioni di salute pubblica.
- **One Health:** salute umana, animale e ambientale sono collegate.

La presenza di un'anomalia statistica **non dimostra un focolaio**. Segnali di allerta richiedono qualità dei dati, contestualizzazione, conferme e supervisione esperta.

### Biosafety / Biosecurity / Cyberbiosecurity

- **Biosafety:** prevenire esposizioni/rilasci **accidentali**.
- **Biosecurity:** prevenire accessi, sottrazioni o usi **non autorizzati/intenzionali**.
- **Cyberbiosecurity:** proteggere dati, strumenti, reti, software e processi che collegano biologia e sistemi digitali.
- **Dual use:** conoscenze/strumenti con applicazioni benefiche ma anche potenzialmente dannose; richiedono valutazione proporzionata dei rischi.

---

Un progetto informatico sensato in questo dominio dovrebbe documentare:

1. **Domanda biologica:** quale fenomeno vuoi studiare e cosa NON puoi inferire?
2. **Provenienza del dato:** campioni, consenso/privacy, raccolta, qualità, metadati.
3. **Pipeline:** preprocessing, controlli, versioni e risultati riproducibili.
4. **Analisi/AI:** baseline, train/test senza leakage, valutazione per gruppi e confondenti.
5. **Interpretazione:** collaborazione con esperti di dominio, limiti e verifiche indipendenti.

Approfondimenti utili: EMBL-EBI Training (bioinformatica), NCBI (database), OMS/WHO (One Health e biorisk), documentazione pandas/scikit-learn per gli aspetti computazionali.

### Pipeline bioinformatiche e interpretazione

La parte informatica più frequente è una **pipeline riproducibile**: input grezzo con identificativi e metadati → controllo qualità → normalizzazione/allineamento → tabella di risultati → analisi → report e limiti. Non esiste un «test universale»: cosa si fa dipende da organismo, sequenziamento, domanda e protocolli.

**FASTQ vs FASTA:** FASTQ conserva anche i caratteri di qualità (*Phred*, con codifica da conoscere); FASTA registra soprattutto una sequenza. Nelle analisi di varianti un file VCF contiene coordinate riferite a una specifica versione del genoma di riferimento: senza *reference build* le posizioni possono essere interpretate male. BED descrive intervalli genomici e spesso usa coordinate zero-based, half-open; altri formati possono usare convenzioni diverse. [UCSC: coordinate counting](https://genome.ucsc.edu/FAQ/FAQtracks.html).

```python
# Verifica innocua di consistenza per una pipeline di sequenze sintetiche.
from Bio import SeqIO
from collections import Counter

counts = Counter()
for record in SeqIO.parse('samples.fasta', 'fasta'):
    seq = str(record.seq).upper()
    # Conteggiamo basi ambigue invece di ignorarle silenziosamente.
    counts['sequences'] += 1
    counts['ambiguous_bases'] += sum(base not in 'ACGT' for base in seq)
print(counts)
```

**Omics/ML:** prima di costruire il modello, verifica unità di analisi (campioni, pazienti, visite), confondenti e *batch effect*; suddividi train/test **per individuo** se più misure provengono dalla stessa persona. Feature importance e correlazione non dimostrano meccanismi causali. Per sistemi di sorveglianza biologica proteggi accessi, tracciabilità e dati sensibili; valida le segnalazioni con esperti di dominio.

**Approfondimenti mirati:** [EMBL-EBI: sequenze e analisi](https://www.ebi.ac.uk/training/), [VCF specification](https://samtools.github.io/hts-specs/VCFv4.3.pdf), [WHO: One Health](https://www.who.int/health-topics/one-health).

## Domande da colloquio

**Bioinformatica vs biologia computazionale?** Molta sovrapposizione: spesso bioinformatica si concentra su gestione/analisi dei dati biologici; biologia computazionale anche su modellazione dei sistemi.

**Sequenziamento vs allineamento?** Il sequenziamento misura/ricostruisce sequenze; l'allineamento confronta sequenze con un riferimento o fra loro.

**Perché il batch effect è pericoloso?** Il modello può imparare differenze di protocollo/laboratorio al posto del segnale biologico.

**Incidenza vs prevalenza?** Nuovi casi in un intervallo vs casi esistenti in un istante/periodo.

**Biosafety vs biosecurity?** Accidenti/esposizioni contro accessi e usi malevoli/non autorizzati.

**Approfondisci quando serve:** [EMBL-EBI Training](https://www.ebi.ac.uk/training/), [Biopython SeqIO](https://biopython.org/wiki/SeqIO), [NCBI sequence resources](https://www.ncbi.nlm.nih.gov/guide/sequence-analysis/). Per bias e validità del ML vedi anche [Data Science](Data%20Science.md).
