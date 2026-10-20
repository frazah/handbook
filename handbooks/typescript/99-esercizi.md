# TypeScript — Esercizi

1. Modella `Invoice` con `id`, `customerId`, `items` e `status` union (`draft`/`sent`/`paid`).
2. Scrivi `calculateTotal(invoice)` che somma i prezzi per quantità e restituisce centesimi interi.
3. Definisci `InvoicePatch` con `Partial<Pick<...>>` senza modificare `id`.
4. Scrivi `isInvoice(value: unknown): value is Invoice` con controlli dei campi di base.
5. Realizza un `fetchInvoice` che controlli `response.ok` e validi JSON.

**Autovalutazione:** nessun `any` ingiustificato, `tsc --noEmit` pulito, casi invalidi gestiti.
