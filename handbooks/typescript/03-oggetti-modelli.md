# Oggetti, interface e type

**Idea.** `interface` e `type` descrivono strutture.
Entrambi vanno bene per oggetti; `type` gestisce anche union, tuple, alias di primitivi.
L'assegnazione è in genere **strutturale**, non nominale.

```ts
// I tipi descrivono il contratto; le istruzioni restano JavaScript a runtime.
interface User {
  id: string;
  name: string;
  email?: string;          // può mancare
  readonly createdAt: Date; // TS blocca riassegnazioni dirette
}

type Admin = User & { permissions: string[] };
const admin: Admin = {
  id: 'u1', name: 'Ada', createdAt: new Date(),
  permissions: ['refunds:read']
};

const emailLabel = admin.email?.toLowerCase() ?? 'email assente';
```

**Attenzione dopo `readonly`:** controlla solo le assegnazioni nel type checker e non rende l'oggetto immutabile a runtime.

Le proprietà con `?`, come `email?: string`, possono mancare: usa `?.` oppure un controllo.

## Shape delle risposte API

In `ApiResponse<T>`, la sigla `<T>` è un *parametro di tipo* (generic).

`T` è un segnaposto: `ApiResponse<User[]>` significa che il campo `data` contiene un array di utenti.

Se scrivessi `ApiResponse<Product>`, lo stesso modello conterrebbe un prodotto.


```ts
// I tipi descrivono il contratto; le istruzioni restano JavaScript a runtime.
type ApiResponse<T> = {
  data: T;
  pagination?: { page: number; total: number };
};

const response: ApiResponse<User[]> = {
  data: [admin], pagination: { page: 1, total: 1 }
};
```

**Attenzione:** `readonly` agisce nel sistema dei tipi, non rende immutabile un oggetto a runtime.  
Le proprietà optional vanno verificate prima dell'accesso.

**Errore comune:** fare `as User` su qualsiasi JSON.  
Per dati esterni serve validazione runtime.
