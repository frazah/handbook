<!-- level: Bioinformatica -->
<!-- summary: Stringhe biologiche, similarità, omologia e limiti -->
# Sequenze, allineamento e somiglianza

Una **sequenza biologica** è una successione ordinata di caratteri (basi del DNA/RNA oppure aminoacidi).  
Gli algoritmi di **allineamento** mettono in corrispondenza posizioni di due o più sequenze, consentendo differenze e lacune (*gap*).

## Prima del codice: cosa riconoscere

**Identità** misura corrispondenza nell’allineamento, **omologia** è un’ipotesi di origine evolutiva comune. Non esiste rigorosamente una «percentuale di omologia».

```text
A C G T A C G T
A C G - A C G T
```

- **Identità:** percentuale di posizioni uguali nell'allineamento, secondo una definizione precisa.
- **Similarità:** punteggio che può considerare somiglianze fra aminoacidi.
- **Omologia:** relazione di origine evolutiva comune; è un'ipotesi **qualitativa**. Non si parla rigorosamente di «70% omologhi».
- **Geni ortologhi:** derivano da un evento di speciazione; **paraloghi:** da duplicazione genica.

## Perché un match non basta

La rilevanza dipende da lunghezza, composizione, frequenza casuale degli allineamenti e modello statistico.  
Un match breve può comparire per caso.  
I metodi professionali usano punteggi, significatività e banche dati curate.

**Esempio da informatica:** l'edit distance è una buona introduzione algoritmica, ma non sostituisce gli score biologici né un'analisi filogenetica.

**Da ricordare:** una sequenza simile non implica stessa funzione, stessa specie o stessa capacità biologica.
