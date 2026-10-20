<!-- level: Fondamenti -->
<!-- summary: Array, Record, Partial, Pick, Omit, keyof, tuple e accessi sicuri -->
# Array, `Record` e utility types

Gli **utility types** sono strumenti incorporati in TypeScript che creano un nuovo tipo partendo da uno esistente.

Ti servono, per esempio, quando un'API crea un prodotto senza ancora avere un `id`, oppure quando un endpoint modifica solo alcuni campi.

## 1. Il modello di partenza

**Prima di leggere il codice — simboli e termini:**

- **`keyof T`**: insieme dei nomi delle proprietà di `T`.

```ts
// Questo è il modello di un prodotto già salvato nel database.
type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  details: {
    category: string;
    weight: number;
  };
};

const product: Product = {
  id: 'p1',
  name: 'Mouse',
  price: 25,
  active: true,
  details: {
    category: 'tech',
    weight: 100,
  },
};
```

`type Product = { ... }` descrive la *forma* di un oggetto: quali proprietà esistono e quali valori sono ammessi.

## 2. `Pick<T, K>` e `Omit<T, K>`

`<T, K>` contiene **parametri di tipo**, non valori JavaScript: `T` indica un tipo di partenza, `K` un insieme di sue chiavi.

- `Pick` **tiene** soltanto le proprietà elencate.
- `Omit` **esclude** le proprietà elencate.

```ts
// Il client mostra soltanto questi due campi.
type ProductPreview = Pick<Product, 'id' | 'name'>;

const preview: ProductPreview = {
  id: 'p1',
  name: 'Mouse',
};

// Quando crei un prodotto, l'id viene generato dal server.
type ProductDraft = Omit<Product, 'id'>;
```

**Attenzione, proprio qui:** `Pick` e `Omit` agiscono sui tipi **durante lo sviluppo**.  
Non eliminano proprietà dagli oggetti a runtime: per creare davvero un nuovo oggetto devi selezionare le proprietà nel codice.

## 3. `Partial<T>`: modifiche parziali

`Partial<T>` rende *opzionali* tutte le proprietà di primo livello di `T`.

```ts
// Con PATCH puoi inviare uno o più campi, non il prodotto intero.
// 1. Scegliamo soltanto le proprietà modificabili.
type EditableProduct = Pick<Product, 'name' | 'price' | 'active'>;

// 2. Rendiamo facoltative quelle proprietà (al primo livello).
type ProductPatch = Partial<EditableProduct>;

const patch: ProductPatch = { price: 22 }; // gli altri campi possono mancare

// Spread: crea un nuovo oggetto combinando originale e modifiche.
function updateProduct(
  item: Product,
  changes: ProductPatch,
): Product {
  // ...item copia le proprietà originali.
  // ...changes sovrascrive soltanto quelle passate nel patch.
  return { ...item, ...changes };
}

const updated = updateProduct(product, patch);
console.log(updated.price); // 22
```

**Attenzione subito dopo `Partial`:** è *shallow* (superficiale).  
Se scrivi `Partial<Product>`, puoi omettere `details`, ma se lo fornisci deve avere ancora **entrambe** le proprietà `category` e `weight`.  
Non rende opzionali i campi annidati.  
Per aggiornamenti profondi serve un tipo specifico o una strategia dedicata.

## 4. `Record<K, V>`: un dizionario tipizzato

Le due lettere sono segnaposto per tipi: `K` è il tipo delle chiavi, `V` il tipo dei valori.

```ts
// Chiavi: stringhe. Valori: numeri.
const stockByCategory: Record<string, number> = {
  books: 12,
  games: 8,
};

// Una chiave dinamica potrebbe non esistere nell'oggetto reale.
const count = stockByCategory['clothes'];
console.log(count); // undefined a runtime
```

**Attenzione subito dopo `Record`:** `Record<string, number>` dice al compilatore quale tipo *avrebbero* i valori, ma **non crea tutte le possibili chiavi**.  
Per accessi dinamici abilita `noUncheckedIndexedAccess` (l'accesso diventa `number | undefined`) oppure modella `Record<string, number | undefined>` e controlla l'assenza della chiave.

## 5. Tuple e array `readonly`

```ts
// Tuple: lunghezza e posizione hanno un significato stabilito.
type Coordinates = [latitude: number, longitude: number];
const rome: Coordinates = [41.9, 12.5];

// Array in sola lettura dal punto di vista del type checker.
const productIds: readonly string[] = ['p1', 'p2'];
// productIds.push('p3'); // errore TypeScript, non blocco runtime
```

Le etichette `latitude:` e `longitude:` rendono più leggibili i due elementi; non cambiano il formato JavaScript dell'array.

## 6. `keyof`, `extends` e `T[K]`

`keyof Product` significa **l'insieme dei nomi delle proprietà** di `Product`.

`K extends keyof T` significa che la chiave `K` deve essere una chiave valida dell'oggetto `T`; qui `extends` esprime un **vincolo sul tipo**, non necessariamente ereditarietà tra classi.

`T[K]` recupera il *tipo* della proprietà `K` all'interno di `T`.

```ts
// T è il tipo dell'oggetto; K è una sua chiave consentita.
function getField<T, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  // T[K] indica il tipo del campo corrispondente alla chiave K.
  return obj[key];
}

const example = { name: 'Libro', price: 12 };
const price = getField(example, 'price'); // number, inferito automaticamente
// getField(example, 'missing'); // errore: la chiave non esiste
```

**Quando usarli:** modelli API, form, endpoint PATCH, helper su collezioni e campi.  
Non introdurre utility types se una semplice interfaccia è già più leggibile.
