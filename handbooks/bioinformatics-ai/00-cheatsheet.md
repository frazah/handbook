<!-- level: Ripasso rapido -->
<!-- summary: DNA, RNA, proteine, omics, ML, epidemiologia e biosecurity in una pagina -->
# Cheatsheet — la mappa in una pagina

| Concetto | Significato essenziale | Analogia informatica (imperfetta) |
| --- | --- | --- |
| Cellula | Unità funzionale della vita | Sistema in esecuzione |
| DNA | Molecola che conserva informazione ereditaria | Archivio persistente |
| Gene | Regione di DNA con un prodotto funzionale | Modulo, non funzione 1:1 |
| RNA | Famiglia di molecole con ruoli di espressione e regolazione | Messaggi/intermedi |
| Proteina | Molecola che svolge molte funzioni nella cellula | Componente operativo |
| Genoma | Insieme del materiale genetico di un organismo | Intero corpus di dati |
| Trascrizione | DNA → RNA | Copia regolata di informazione |
| Traduzione | mRNA → proteina | Interpretazione secondo un codice |
| Variante | Differenza nella sequenza rispetto a un riferimento | `diff`, non automaticamente bug |
| Espressione genica | Quantità/attività dei prodotti di certi geni | Telemetria contestuale |
| Omics | Misure ad alta dimensionalità di molte molecole | Data analytics su migliaia di feature |
| Biosafety | Prevenire esposizioni e rilasci accidentali | Safety |
| Biosecurity | Prevenire accessi, sottrazioni e usi impropri | Security |
| Cyberbiosecurity | Difesa congiunta di sistemi digitali e infrastrutture biologiche | Cybersecurity su sistemi cyber-fisici |
| Sorveglianza | Raccolta e analisi sistematiche di segnali sanitari | Observability pubblica con vincoli etici |
| One Health | Salute di persone, animali e ambiente interconnessa | Sistema di sistemi |

## Regole che valgono quasi sempre

1. **Correlazione ≠ causalità.** Un biomarcatore non dimostra la causa di un problema.
2. **Sequenza ≠ funzione certa.** Un gene o una variante richiede contesto biologico.
3. **Predizione ≠ diagnosi.** Un classificatore non sostituisce validazione clinica.
4. **Dataset ≠ popolazione.** Controlla bias di selezione, batch e privacy.
5. **AUC alta ≠ utilità clinica.** Misura sensibilità, specificità, calibrazione e impatto.
6. **Allerta ≠ evento accertato.** La sorveglianza richiede verifica da professionisti.
7. **Biologia ≠ codice deterministico.** Rumore, evoluzione e contesto contano.

## Pipeline mentale

```text
Domanda biologica → campioni/misure → QC → dataset + metadati
                  → analisi statistica / ML → verifica indipendente
                  → interpretazione biologica → eventuale decisione umana
```

**Navigazione:** `01`–`09` per i termini base, `10`–`16` per i dati, `17`–`20` per AI, `21`–`26` per prevenzione e sicurezza.

---

## Dati e formati: riconoscili al volo

| Formato / sigla | Contiene | A cosa serve |
|---|---|---|
| FASTA (`.fa`, `.fasta`) | ID e sequenza | riferimento / sequenze DNA o proteine |
| FASTQ (`.fq`, `.fastq`) | sequenza + qualità per base | output grezzo di sequenziamento |
| SAM/BAM/CRAM | allineamenti di read | posizioni rispetto a riferimento |
| VCF | varianti e annotazioni | differenze genomiche |
| GFF/GTF | coordinate di geni ed elementi | annotazioni del genoma |
| TSV/CSV | tabelle e metadati | conteggi, campioni e covariate |
| RNA-seq | conteggi/letture RNA | stima dell'espressione |
| Proteomica | peptidi/proteine misurate | composizione e abbondanza proteica |
| Metadata | campione, batch, periodo, fonte | interpretare e riprodurre le analisi |

```text
>sample_A
ACGTACGT
>sample_B
ACGTTTGT
```

**Leggi così:** `>` introduce l'identificatore FASTA; le lettere sulla riga successiva rappresentano basi nucleotidiche.  
Non è una sequenza clinica reale.

## Biologia molecolare — termini e distinzioni

| Termine | Significato |
|---|---|
| Nucleotide | unità che compone DNA/RNA |
| A, C, G, T | basi del DNA; nell'RNA T è sostituita da U |
| Gene | regione di DNA associata a prodotti funzionali |
| Allele | versione di un gene/posizione genetica |
| Mutazione / variante | cambiamento / differenza osservata, non per forza patologica |
| Genotipo | caratteristiche genetiche misurate |
| Fenotipo | caratteristica osservata (dipende anche da ambiente) |
| Trascrizione | DNA → RNA |
| Traduzione | mRNA → proteina |
| Genomica | analisi su larga scala di genomi |
| Metagenomica | materiale genetico da comunità di organismi |
| Bioinformatica | algoritmi e dati applicati a problemi biologici |

## Epidemiologia, prevenzione e sicurezza

| Termine | Da ricordare |
|---|---|
| Incidenza | nuovi casi nel tempo; richiede popolazione a rischio adeguata |
| Prevalenza | casi presenti in un periodo/momento |
| Sensibilità | fra i veri positivi quanti vengono identificati |
| Specificità | fra i veri negativi quanti vengono esclusi |
| Precision / PPV | fra i positivi predetti quanti sono davvero positivi |
| Confondente | fattore associato sia all'esposizione sia all'esito |
| Batch effect | differenza tecnica fra gruppi di misura |
| Biosafety | ridurre incidenti ed esposizioni |
| Biosecurity | ridurre accessi/usi impropri intenzionali |
| Cyberbiosecurity | sicurezza di dati, software e infrastrutture bio-digitali |
| One Health | persone, animali ed ecosistemi interconnessi |
| Early warning | segnale da verificare, non prova automatica di emergenza |

**Regola centrale:** predizione ≠ diagnosi, associazione ≠ causalità, anomalia ≠ evento accertato.  
I dati dei laboratori dell'handbook sono sintetici, educativi e non destinati a decisioni cliniche o interventi di sicurezza reali.
