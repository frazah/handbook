<!-- level: AI + Biologia -->
<!-- summary: Protein language models, strutture e differenza tra predire e validare -->
# AI per proteine, strutture e scoperte biologiche
## Prima del codice: cosa riconoscere

Prevedere una struttura proteica non equivale a dimostrare sperimentalmente funzione, stabilità o interazione in tutte le condizioni. Le predizioni richiedono un’interpretazione competente.


Una **proteina** è una catena di aminoacidi; configurazione spaziale, contesto cellulare e interazioni condizionano ciò che fa.  
Un **protein language model** apprende regolarità dalle sequenze come un language model apprende pattern di testo, ma le probabilità apprese non costituiscono una prova sperimentale.

## Tipi di applicazioni

- **Predizione della struttura:** stima della geometria di proteine a partire da sequenze e altre informazioni, con misure di confidenza.
- **Annotazione funzionale:** proposta di funzioni possibili per sequenze poco caratterizzate.
- **Ricerca di somiglianze:** rappresentazioni (*embedding*) per confronto e clustering.
- **Analisi d'immagine:** microscopia e quantificazione di cellule o tessuti in contesti autorizzati.

## Come valutarle

1. Quali dati hanno usato gli autori per il training?
2. Il test contiene sequenze strettamente simili a quelle di training?
3. Come viene espressa l'incertezza e cosa significa il punteggio?
4. Esistono esperimenti indipendenti che confermano l'ipotesi?
5. Quali rischi di uso improprio o *dual use* richiede di valutare l'applicazione?

**Errore tipico:** mostrare un rendering 3D convincente e interpretarlo come prova della funzione biologica.
Il rendering è una visualizzazione di un modello o di una struttura, non una validazione autonoma.

Risorse: [UniProtKB](https://www.uniprot.org/UniProt) · [RCSB PDB](https://www.rcsb.org/).
