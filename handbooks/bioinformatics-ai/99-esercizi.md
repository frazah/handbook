<!-- level: Esercizi -->
<!-- summary: Quiz e casi pratici con soluzioni di autoverifica -->
# Esercizi per ripassare (con soluzioni)

Prova a rispondere **prima** di leggere la sezione finale.

1. Perché un virus non viene generalmente descritto come una cellula?
2. Che differenza c'è tra un gene e una proteina?
3. Qual è la differenza tra replicato tecnico e replicato biologico?
4. Un FASTA conserva la qualità delle letture? Quale formato la include?
5. Due sequenze sono identiche all'85%: sono «85% omologhe»?
6. Perché uno split casuale per riga può essere scorretto su dati da più visite dello stesso paziente?
7. Differenza principale fra incidenza e prevalenza?
8. Un allarme automatico segnala un'anomalia: è un focolaio accertato?
9. Spiega biosafety, biosecurity, cyberbiosecurity in tre righe.
10.  
Proponi un esempio *One Health* senza richiedere dati personali.
11.  
Un modello ha AUC molto alta sul training: cosa devi controllare prima dell'uso?
12.  
Uno studio trova correlazione fra indice ambientale e segnalazioni: che cosa **non** può concludere direttamente?

## Soluzioni

1. È acellulare e dipende da cellule ospiti per la replicazione.
2. Un gene è una regione di DNA associata a un prodotto; una proteina è una molecola di aminoacidi con funzioni varie.
3. Il tecnico ripete una misurazione; il biologico rappresenta variabilità di origini biologiche indipendenti.
4. No: FASTQ include valori di qualità per base.
5. No: l'omologia è una relazione evolutiva qualitativa; l'85% è una possibile misura di identità dell'allineamento.
6. Perché righe dello stesso soggetto introducono leakage e gonfiano le metriche.
7. Incidenza: nuovi eventi in un periodo. Prevalenza: soggetti con la condizione in un momento/periodo.
8. No, richiede validazione, contesto e indagine dei professionisti competenti.
9. Accidenti; usi impropri/accessi; vulnerabilità e protezioni digitali in contesti biologici.
10.  
Confrontare indicatori ambientali aggregati, salute animale e statistiche sanitarie pubbliche verificando qualità e limiti.
11.  
Split indipendente, bias, leakage, calibrazione, performance esterna, errori per sottogruppo, impatto.
12.  
Non può dedurre da sola un nesso causale né che un intervento specifico abbia effetto.

## Mini progetto facoltativo

Scegli un dataset **sintetico o pubblico non sensibile**, scrivi una *data card* di una pagina (fonte, definizioni, unità, limiti), implementa due controlli qualità e un report riproducibile.
