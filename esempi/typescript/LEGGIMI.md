# Demo TypeScript: riepilogo ordine

Nella cartella `esempi/typescript` (richiede Node e npm):

```bash
npm init -y
npm install --save-dev typescript
npx tsc -p tsconfig.json
node dist/order-summary.js
```

`npm install --no-save` installerà il compilatore nella cartella locale; l'handbook resta offline, ma il primo install richiede l'accesso al registry npm. Per un test solo dei tipi `npx tsc --noEmit -p tsconfig.json`.
