<!-- level: Biologia da zero -->
<!-- summary: Esperimenti, campioni, misure, controlli, replicati e batch effect -->
# Come si producono dati biologici

Un dato biologico non nasce «già pulito» come in un tutorial SQL: nasce da una domanda sperimentale, **campionamento**, uno strumento e una pipeline di elaborazione.

```text
Domanda → disegno dello studio → campioni → strumento
        → file grezzi → quality control → dataset analitico
```

Parole fondamentali:

- **Campione biologico:** materiale raccolto secondo procedure definite da personale autorizzato.
- **Controllo:** riferimento che permette di interpretare il risultato.
- **Replicato biologico:** campione indipendente dal punto di vista biologico.
- **Replicato tecnico:** ripetizione della misurazione sullo stesso materiale o origine.
- **Batch effect:** differenza dovuta a lotto, strumento, laboratorio, data o procedura, e non al fenomeno biologico di interesse.
- **Confondente:** variabile associata sia all'esposizione sia all'esito, in grado di distorcere la relazione osservata.

## Esempio realistico

Se tutti i campioni del gruppo A sono misurati di lunedì e tutti quelli del gruppo B di venerdì, il modello potrebbe imparare il **giorno di misura**, non la biologia.  
Nei dataset omics questo può dominare un segnale apparentemente eccellente.

**Checklist:** qual è l'unità di osservazione?  
Da chi/che cosa proviene il campione?  
Esistono permessi e consenso?  
Quanti replicati indipendenti?  
Come sono codificati i mancanti?
