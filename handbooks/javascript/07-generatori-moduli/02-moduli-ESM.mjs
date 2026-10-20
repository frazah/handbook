// JAVASCRIPT HANDBOOK 07.2 — ES Modules: import/export/dynamic import
// Fonte: https://javascript.info/modules-intro
// ESEGUIRE: node 02-moduli-ESM.mjs
// Nel browser: <script type="module" src=".../02-moduli-ESM.mjs"></script>
// I moduli hanno scope proprio, strict implicito e import 'live bindings'.
import { sum, version as apiVersion } from './utils.mjs';
import formatUser from './utils.mjs'; // export default, nome locale libero

console.log(sum(2, 3), apiVersion, formatUser({ name: 'Ada' }));
const modulePath = './utils.mjs';
const dynamic = await import(modulePath); // carica un modulo a runtime
console.log(dynamic.sum(4, 5));
// import statico deve essere al top level; dynamic import ritorna Promise.
// import/export NON funzionano come moduli nel normale <script> classico.
// Browser: usa un server locale (file:// può avere restrizioni CORS).
// In Node: .mjs o package.json con "type": "module".
// Module caching: lo stesso modulo viene normalmente valutato una sola volta.
