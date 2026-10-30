# Vue 3 + TypeScript

> Framework progressivo per interfacce: template HTML dichiarativi, **reattività automatica** e Single File Component (`.vue`) con template, logica e stile insieme.
> Prerequisiti: [JavaScript](../Languages/JavaScript.md) · [TypeScript](../Languages/TypeScript.md) · Collegate: [React](React.md) (confronto in fondo) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md)

## Modello mentale

- **Reattività con Proxy:** `ref` e `reactive` avvolgono i dati in un Proxy. Quando un componente o un `computed` *legge* un valore, Vue registra la dipendenza; quando lo *scrivi*, Vue sa esattamente chi aggiornare.
- Al contrario di React, non si ri-esegue tutto il componente: si aggiornano **solo gli effetti che dipendono dal dato cambiato**. Niente array di dipendenze, niente `useMemo`.
- Lo stato si **muta direttamente** (`cart.items.push(x)`): è il Proxy a intercettare la modifica.
- Gli aggiornamenti del DOM sono **asincroni e raggruppati** nel tick successivo: per leggere il DOM aggiornato usa `await nextTick()`.
- Il template viene compilato in una render function ottimizzata (le parti statiche vengono individuate in compilazione).
- Comunicazione: le **props** scendono, gli **eventi** (`emit`) salgono; per lo stato condiviso si usano composable, `provide/inject` o **Pinia**.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Interpolazione | `{{ product.name }}` |
| Attributo dinamico | `:href="url"` (= `v-bind:href`) · `:class="{ active: isActive }"` |
| Evento | `@click="addToCart(product.id)"` (= `v-on:click`) · `@submit.prevent="save"` |
| Condizionale | `v-if` / `v-else-if` / `v-else` (crea e distrugge) · `v-show` (nasconde con CSS) |
| Lista | `<li v-for="item in items" :key="item.id">` |
| Two-way binding | `v-model="email"` · `v-model.number="qty"` · `v-model.trim` |
| Slot | `<slot />` · `<slot name="footer" />` · `<template #footer>` |
| Ref al DOM | `<input ref="search">` + `const search = useTemplateRef("search")` (3.5+) |

Mai `v-if` e `v-for` sullo stesso elemento: filtra prima con un `computed`.

## Single File Component con `<script setup>`

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

type Product = { id: number; name: string; priceCents: number };

const props = defineProps<{ product: Product }>();
const emit = defineEmits<{ add: [productId: number, quantity: number] }>();

const quantity = ref(1);  // nel template si usa senza .value
const subtotal = computed(() => (props.product.priceCents * quantity.value) / 100);
</script>

<template>
  <article class="card">
    <h3>{{ product.name }}</h3>
    <input v-model.number="quantity" type="number" min="1" />
    <button @click="emit('add', product.id, quantity)">
      Aggiungi ({{ subtotal.toFixed(2) }} €)
    </button>
  </article>
</template>

<style scoped>
.card { border: 1px solid #ddd; } /* scoped: vale solo per questo componente */
</style>
```

Le props sono **in sola lettura**: per modificarle, emetti un evento e lascia decidere il genitore. Con `withDefaults(defineProps<...>(), { ... })` dai valori di default.

## `ref` vs `reactive`

| | `ref(x)` | `reactive(obj)` |
|---|---|---|
| Accetta | qualsiasi valore | solo oggetti, array, Map, Set |
| Accesso nello script | `x.value` | `obj.campo` |
| Riassegnazione completa | `x.value = nuovo` ✅ | `obj = nuovo` ❌ (perde la reattività) |
| Destructuring | — | ❌ perde la reattività (usa `toRefs`) |

Regola pratica: **usa `ref` ovunque**; `reactive` per oggetti di stato raggruppati che non riassegni.

```ts
import { reactive, toRefs } from "vue";

const filters = reactive({ status: "paid", page: 1 });
const { status } = filters;           // ❌ semplice stringa: non è più reattiva
const { page } = toRefs(filters);     // ✅ ref collegato a filters.page
```

## `computed`, `watch`, `watchEffect`

| | Quando |
|---|---|
| `computed` | valore **derivato** da altri dati: è in cache e si ricalcola solo se cambiano le dipendenze |
| `watch(source, cb)` | **effetto collaterale** su un dato preciso, con accesso a valore nuovo e vecchio |
| `watchEffect(cb)` | effetto che traccia automaticamente tutto ciò che legge |

```ts
import { ref, watch } from "vue";

const status = ref("paid");
const orders = ref<{ id: number; totalCents: number }[]>([]);

// Ricarica gli ordini quando cambia il filtro; onCleanup annulla la richiesta precedente.
watch(status, async (newStatus, _old, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  const res = await fetch(`/api/orders?status=${newStatus}`, { signal: controller.signal });
  orders.value = await res.json();
}, { immediate: true }); // esegue anche al primo caricamento
```

Errore comune: usare `watch` per calcolare un valore derivato. Se puoi esprimerlo come `computed`, usa `computed`.

## v-model sui componenti

`defineModel` (Vue 3.4+) crea una prop collegata in due direzioni con il genitore, senza scrivere a mano la coppia prop + evento `update:modelValue`.

```vue
<!-- QuantityInput.vue -->
<script setup lang="ts">
const quantity = defineModel<number>({ default: 1 });
</script>

<template>
  <button @click="quantity = Math.max(1, quantity - 1)">−</button>
  {{ quantity }}
  <button @click="quantity++">+</button>
</template>

<!-- Nel genitore: <QuantityInput v-model="item.quantity" /> -->
```

## Slot

Gli slot permettono al genitore di passare **markup** al figlio. Gli *scoped slot* espongono dati del figlio al contenuto del genitore.

```vue
<!-- DataTable.vue: il figlio gestisce la lista, il genitore decide come mostrare ogni riga -->
<template>
  <ul>
    <li v-for="row in rows" :key="row.id">
      <slot name="row" :row="row" />
    </li>
  </ul>
</template>

<!-- Uso: <DataTable :rows="orders"><template #row="{ row }">#{{ row.id }}</template></DataTable> -->
```

## Lifecycle

| Hook | Quando |
|---|---|
| `onMounted` | il componente è nel DOM (accesso a elementi, librerie esterne) |
| `onUpdated` | dopo un aggiornamento del DOM (raramente necessario) |
| `onUnmounted` | rimozione: pulisci timer, listener, sottoscrizioni |

Il codice dentro `<script setup>` stesso viene eseguito **una sola volta**, alla creazione del componente.

## Composable

Una funzione `useQualcosa()` che incapsula **stato reattivo + logica** riutilizzabile. È l'equivalente dei custom hook di React e sostituisce i mixin di Vue 2 (che avevano collisioni di nomi e origine dei dati poco chiara).

```ts
import { ref, onMounted, onUnmounted } from "vue";

export function useOnlineStatus() {
  const online = ref(navigator.onLine);
  const update = () => (online.value = navigator.onLine);
  onMounted(() => { addEventListener("online", update); addEventListener("offline", update); });
  onUnmounted(() => { removeEventListener("online", update); removeEventListener("offline", update); });
  return { online };  // ogni componente che lo chiama ha il proprio stato
}
```

## provide / inject

Passa un valore a tutti i discendenti senza prop drilling. Usa una `InjectionKey` tipizzata.

```ts
import { inject, provide, ref, type InjectionKey, type Ref } from "vue";

export const CurrencyKey: InjectionKey<Ref<string>> = Symbol("currency");
// Nell'antenato:    provide(CurrencyKey, ref("EUR"))
// Nel discendente:  const currency = inject(CurrencyKey, ref("EUR"))  // secondo argomento: default
```

## Pinia (stato globale)

Lo store ufficiale: stato, getter (`computed`) e action, con supporto completo a TypeScript e DevTools.

```ts
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref<{ productId: number; quantity: number; priceCents: number }[]>([]);
  const totalCents = computed(() => items.value.reduce((s, i) => s + i.priceCents * i.quantity, 0));

  function add(productId: number, priceCents: number) {
    const existing = items.value.find((i) => i.productId === productId);
    if (existing) existing.quantity++;  // mutazione diretta: la reattività la intercetta
    else items.value.push({ productId, quantity: 1, priceCents });
  }
  return { items, totalCents, add };
});
// In un componente: const cart = useCartStore(); const { items } = storeToRefs(cart);
```

## Vue Router

```ts
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/products", component: () => import("./ProductList.vue") }, // lazy loading
    { path: "/orders/:id", component: () => import("./OrderDetail.vue"), meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {  // navigation guard
  if (to.meta.requiresAuth && !localStorage.getItem("token")) return "/login";
});
// Nel componente: const route = useRoute(); route.params.id
```

## Performance

- `computed` invece di metodi nel template (i metodi si rieseguono a ogni render).
- `shallowRef` / `shallowReactive` per grandi strutture che sostituisci per intero (niente Proxy profondo).
- `v-once` (renderizza una volta), `v-memo` (salta aggiornamenti di sottoalberi), `KeepAlive` (mantiene in memoria componenti nascosti).
- Lazy loading di route e componenti pesanti (`defineAsyncComponent`).

## Vue vs React

| | Vue | React |
|---|---|---|
| Template | HTML + direttive | JSX |
| Reattività | Proxy, tracciamento automatico delle dipendenze | stato immutabile, ri-esecuzione del componente |
| Aggiornare lo stato | mutazione diretta | nuovo oggetto + setter |
| Valori derivati | `computed` (cache automatica) | calcolo nel render, `useMemo` |
| Effetti | `watch` / `watchEffect` (dipendenze automatiche) | `useEffect` (dipendenze esplicite) |
| Stato globale | Pinia (ufficiale) | Context, Redux, Zustand… |
| Stile | `<style scoped>` integrato | CSS Modules, CSS-in-JS, Tailwind |

## Domande da colloquio

**Base**
- **`v-if` vs `v-show`?** `v-if` crea e distrugge gli elementi (costo al toggle, nessun costo se falso); `v-show` li lascia nel DOM e cambia `display` (costo iniziale, toggle economico).
- **Perché serve `:key` in `v-for`?** Per far riconoscere a Vue ogni elemento tra un aggiornamento e l'altro, evitando di riusare stato e DOM sull'elemento sbagliato.
- **Come comunicano padre e figlio?** Props verso il basso, `emit` verso l'alto; `v-model` è una scorciatoia per prop + evento `update:modelValue`.

**Intermedio**
- **`ref` vs `reactive`?** `ref` funziona con qualsiasi valore e si legge con `.value`; `reactive` solo con oggetti, e perde la reattività se fai destructuring o lo riassegni.
- **`computed` vs `watch`?** `computed` produce un valore derivato e lo mette in cache; `watch` esegue effetti collaterali (fetch, log, storage) quando un dato cambia.
- **Come funziona la reattività di Vue 3?** I Proxy intercettano letture (tracciamento delle dipendenze) e scritture (trigger degli effetti dipendenti). Vue 2 usava `Object.defineProperty`, che non vedeva le nuove proprietà né gli indici degli array.
- **Composable vs mixin?** I composable rendono esplicita l'origine di ogni valore, evitano collisioni di nomi e si tipizzano bene; i mixin fondevano opzioni in modo implicito.
- **Come carichi i dati di una route?** Con un composable o un `watch` sul parametro della route (con `immediate: true`), gestendo gli stati di caricamento, vuoto ed errore e annullando la richiesta precedente se il parametro cambia.
- **Pinia o Vuex?** Pinia è lo store ufficiale di Vue 3: API più semplice (niente mutation), ottimo supporto a TypeScript e store modulari. Vuex è in manutenzione.

**Avanzato**
- **Perché serve `nextTick`?** Gli aggiornamenti del DOM sono raggruppati e applicati in modo asincrono: dopo aver modificato lo stato, il DOM non è ancora aggiornato fino al tick successivo.
- **Composition API vs Options API?** La Composition API raggruppa il codice per funzionalità invece che per tipo di opzione, si tipizza meglio e permette di estrarre la logica nei composable; la Options API resta valida per componenti semplici.
- **Quando `shallowRef`?** Per grandi oggetti immutabili o di librerie esterne che sostituisci per intero: evita di rendere reattivo in profondità ogni campo.
- **Vue vs React, in una frase?** Vue traccia le dipendenze e aggiorna in modo mirato con stato mutabile; React ri-esegue il componente e confronta il risultato, con stato immutabile.
- **Come ottimizzi una lista lenta?** Key stabili, `computed` per filtri e ordinamenti, `shallowRef` per dati grandi, virtualizzazione per migliaia di righe e paginazione lato server.
- **Cos'è Nuxt e quando serve l'SSR?** Nuxt è il meta-framework di Vue con SSR, generazione statica e routing basato su file. L'SSR serve per SEO e per un primo rendering veloce, al costo di un server e dell'idratazione nel client.

## Approfondisci

- [Vue — Guida](https://vuejs.org/guide/introduction.html) · [Reattività in profondità](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Pinia](https://pinia.vuejs.org/) · [Vue Router](https://router.vuejs.org/)
- [Vue + TypeScript](https://vuejs.org/guide/typescript/composition-api.html)
