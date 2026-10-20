# Convenzioni didattiche del Dev Handbook Hub

Queste regole valgono per **tutti gli handbook e tutte le recipes** presenti e future.
Lo scopo è poter capire un esempio durante il primo studio e ritrovare la sintassi durante il ripasso.

## Regole per ogni capitolo

1. **Un concetto nuovo per volta.** Prima spiega un costrutto, poi mostrane la combinazione con altri.
2. **Niente firme di funzione compresse se introducono più di un concetto.** Preferisci dichiarare prima il tipo o l'interfaccia delle props.
3. **Blocchi di codice multilinea**, indentati uniformemente. Se cambiano scenario, file o argomento, crea un nuovo blocco con una frase che lo introduce.
4. **Commenti dove il lettore potrebbe fermarsi.** Spiega callback, generics, destructuring, spread, `map`, ternari, `await`, JSX e parametri complicati. Evita commenti tautologici (`// dichiara una variabile`).
5. **Definisci simboli nuovi prima del primo utilizzo.** Per esempio `<T>`, `=> void`, `children`, `key`, `?.`, `??`, `as`, `: number` e gli eventi.
6. **Avvertenze vicino all'esempio pertinente**, non tutte accumulate in fondo. Spiega la conseguenza pratica dell'errore.
7. **Esempi realistici, piccoli e consistenti.** Preferisci prodotti, task, ordini e API: il codice deve mostrare un caso d'uso riconoscibile.
8. **Distingui codice completo da frammenti.** Se manca una funzione o una dipendenza, dillo esplicitamente. Non far credere che un esempio parziale sia autonomo.
9. **Cheatsheet dense ma consultabili.** Aggiungi sintassi e pattern utili; mostra la forma chiara come predefinita e la forma compatta eventualmente dopo.
10. **Non insegnare pratiche scorrette per brevità.** Per input esterni usa validazione runtime, per stato React evita mutazioni, per esempi async gestisci errori e cleanup quando pertinenti.

## Esempio: da evitare nella prima spiegazione

```tsx
function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  return <button onClick={() => onAdd('Task')}>Aggiungi</button>;
}
```

## Esempio: impostazione preferita

```tsx
// 1. Tipo delle props: il componente riceve una funzione.
type AddTaskProps = {
  onAdd: (title: string) => void;
};

// 2. Parametro tipizzato senza destructuring: lettura più semplice.
function AddTask(props: AddTaskProps) {
  // 3. L'handler verrà chiamato durante l'evento click.
  function handleClick() {
    props.onAdd('Task');
  }

  return (
    <button onClick={handleClick}>
      Aggiungi
    </button>
  );
}
```

**Dopo** si potrà mostrare la variante con destructuring, perché il lettore avrà già capito il tipo delle props, la funzione callback e il JSX.

## Struttura consigliata di una lezione

- Titolo e *cosa imparerai*.
- Prerequisiti minimi e spiegazione dei simboli nuovi.
- Esempio semplice, commentato e multilinea.
- Spiegazione **immediatamente dopo** le righe complesse.
- Esempio applicato a un caso reale, separato dal precedente.
- Avvertenze pertinenti collocate accanto al passaggio problematico.
- Riepilogo di sintassi / quando usare e non usare il concetto.

## Regola per gli aggiornamenti con IA

Quando chiedi all'IA di creare o modificare un capitolo, includi questa indicazione:

> Segui `CONVENZIONI-DIDATTICHE.md`. Spiega simboli e tipi nuovi prima di usarli, separa gli esempi indipendenti, prediligi codice multilinea e inserisci commenti mirati alle righe che combinano più concetti. Non comprimere firme TypeScript per risparmiare righe. Mantieni il codice semanticamente corretto.

## Come controllare

- Leggi un capitolo **senza aver letto quello successivo**: ogni nuova sintassi deve essere spiegata prima o immediatamente dopo.
- Copia gli esempi indicati come completi in un progetto demo e prova a eseguirli.
- Verifica che la cheatsheet mostri direttamente la sintassi più comune, senza rinvii obbligatori ad altre fonti.

## Regole per gli handbook non React/TypeScript

- **JavaScript:** tenere separati esempi di Node e browser; spiegare i callback prima delle catene `map/filter/reduce`, e `Promise` prima di `async/await`.
- **Python:** mostrare il corpo su più righe; spiegare `*args`, `**kwargs`, `->`, `| None`, `@decorator` e `yield` alla prima occorrenza.
- **FastAPI:** separare modello dati, dipendenza e rotta; spiegare `Annotated[Tipo, Metadati]` e `Depends(...)` prima delle firme lunghe.
- **SQL:** usare SELECT multilinea; chiarire quali tabelle/colonne sono assunte; tenere query indipendenti in blocchi separati; esplicitare la differenza fra `WHERE`, `HAVING` e `ON`.
- **Data Science:** illustrare maschere booleane prima di `.loc`; distinguere feature/target e training/test; segnalare dataset e dipendenze non inclusi.
- **AI Agents:** distinguere codice eseguibile, pseudocodice e SDK reali; dire dove avvengono controllo schema, autorizzazione e approvazione umana.
- **Bioinformatica:** partire da biologia di base e definire gli acronimi; distinguere misure, inferenze e decisioni. Gli esempi sintetici non sono diagnostici né operativi.

## Quando una singola riga è troppo densa

In presenza di **due o più concetti nuovi nella stessa espressione**, usa una variabile intermedia, un alias di tipo o una funzione con nome.
Metti un commento **sulla riga precedente**, non un commento generico che ripeta soltanto «questo esempio mostra...».
Se due esempi hanno dati, obiettivi o prerequisiti diversi, usa titoli o blocchi di codice distinti.
