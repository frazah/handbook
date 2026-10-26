# Vue 3 + TypeScript — Cheatsheet

> **Quando serve:** interfacce reattive, componenti riutilizzabili e applicazioni web con template HTML. Questa scheda usa Vue 3, **Composition API** e `<script setup lang="ts">` (la sintassi consigliata nei Single-File Components). Prerequisiti: JavaScript e basi TypeScript.

In Vue un file `.vue` (*Single-File Component*, SFC) può contenere **logica**, **template HTML** e **stili**. La UI viene aggiornata quando cambiano i dati reattivi. In Vue 3 esiste anche la Options API (`data`, `methods`, `computed`): è valida, ma qui usiamo Composition API per progetti moderni con TypeScript.

## Sintassi che usi ogni giorno

| Concetto | Sintassi | Significato |
|---|---|---|
| Stato reattivo | `const count = ref(0)` | in JS leggi/scrivi `count.value`; nel template basta `count` |
| Oggetto reattivo | `reactive({ name: '' })` | proxy reattivo; attenzione a destrutturare proprietà primitive |
| Valore derivato | `computed(() => ...)` | ricalcola quando cambiano le dipendenze |
| Interpolazione | `{{ product.name }}` | inserisce testo nel template |
| Attributo dinamico | `:disabled="loading"` | abbrevia `v-bind:disabled` |
| Evento | `@click="add"` | abbrevia `v-on:click` |
| Input controllato | `v-model="query"` | sincronizza input e stato |
| Condizioni | `v-if`, `v-else-if`, `v-else` | monta/smonta rami della UI |
| Visibilità | `v-show="visible"` | nasconde tramite CSS, non smonta il componente |
| Lista | `v-for="item in items" :key="item.id"` | chiave **stabile**, non indice se la lista cambia |
| Props | `defineProps<Props>()` | contratto dei dati ricevuti dal genitore |
| Eventi al genitore | `defineEmits<...>()` | segnala azioni senza modificare direttamente le props |
| Riferimento elemento | `ref<HTMLInputElement \| null>(null)` | accesso controllato al nodo DOM |

**Come leggere `<script setup>`:** quello che dichiari nel blocco è disponibile nel template senza `return` esplicito. `defineProps` e `defineEmits` sono **macro del compilatore**: non importarle. `ref` e `computed`, invece, si importano da `vue`. Le props seguono un flusso genitore → figlio: non mutarle per «rimandare» dati indietro.

## Catalogo: props, eventi, form e stato derivato

File `ProductSearch.vue`: immagina di integrarlo in una pagina e-commerce che deve filtrare il catalogo e inviare un evento quando l'utente aggiunge un prodotto al carrello.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

type Product = {
  id: string;
  name: string;
  priceCents: number;
  inStock: boolean;
};

type Props = {
  products: Product[];
};

// Le props arrivano dal genitore; le leggiamo senza modificarle.
const props = defineProps<Props>();

// Il figlio emette un evento tipizzato verso il genitore.
const emit = defineEmits<{
  add: [productId: string];
}>();

// `ref` rende reattiva la ricerca; `.value` si usa nello script.
const query = ref('');
const inStockOnly = ref(false);

// `computed` è un valore DERIVATO, non uno state da duplicare.
const filteredProducts = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase();

  return props.products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(normalizedQuery);
    const matchesStock = !inStockOnly.value || product.inStock;
    return matchesName && matchesStock;
  });
});

function handleAdd(productId: string) {
  emit('add', productId);
}
</script>

<template>
  <section>
    <label>
      Cerca prodotti
      <input v-model="query" type="search" />
    </label>

    <label>
      <input v-model="inStockOnly" type="checkbox" />
      Solo disponibili
    </label>

    <p v-if="filteredProducts.length === 0">Nessun risultato.</p>

    <ul v-else>
      <li v-for="product in filteredProducts" :key="product.id">
        <strong>{{ product.name }}</strong>
        <span>{{ (product.priceCents / 100).toFixed(2) }} €</span>
        <button
          type="button"
          :disabled="!product.inStock"
          @click="handleAdd(product.id)"
        >
          Aggiungi
        </button>
      </li>
    </ul>
  </section>
</template>
```

**Nel componente genitore** passa una lista reale di prodotti e registra l'handler con `@add`:

```vue
<!-- App.vue / pagina catalogo: frammento di template -->
<ProductSearch :products="products" @add="addProductToCart" />
```

Qui `products` e `addProductToCart` sono definiti dal genitore (API, store o stato locale). Il frammento **non è un secondo componente autonomo**. I prezzi in centesimi riducono problemi di precisione; in una app internazionale formatta in modo locale con `Intl.NumberFormat` e gestisci valute e arrotondamenti secondo il dominio.

## Computed, watch e lifecycle: quando usarli

- **`computed`** per risultati derivati, come `filteredProducts` o un totale: Vue ne memorizza il valore finché le dipendenze reattive non cambiano.
- **`watch`** per *effetti collaterali* quando varia uno stato preciso: una chiamata HTTP al cambiare dell'ID, sincronizzare un sistema esterno ecc.
- **`watchEffect`** segue automaticamente le dipendenze lette durante l'esecuzione sincrona, meno esplicito di `watch`.
- **`onMounted` / `onUnmounted`** per risorse che esistono solo nel browser (listener, interfacce DOM); pulisci sempre eventi e timer.

Esempio: recupero dati che cambia al cambiare dell'ID prodotto. Inserisci questo codice dentro `<script setup lang="ts">` di un componente che riceve `productId`.

```ts
import { ref, watch } from 'vue';

type ProductDetails = { id: string; name: string; description: string };

type DetailsProps = { productId: string };
const props = defineProps<DetailsProps>();

const product = ref<ProductDetails | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

watch(
  () => props.productId, // La sorgente osservata è la prop, non il suo snapshot.
  async (id, _oldId, onCleanup) => {
    const controller = new AbortController();
    // Se l'ID cambia prima della risposta, annulla la richiesta obsoleta.
    onCleanup(() => controller.abort());

    loading.value = true;
    error.value = null;
    product.value = null;

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Il cast NON valida il JSON: usa uno schema runtime per API non fidate.
      const data: ProductDetails = await response.json();
      if (!controller.signal.aborted) product.value = data;
    } catch (caught) {
      if (!controller.signal.aborted) error.value = String(caught);
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  },
  { immediate: true }, // Carica una volta subito, poi a ogni cambio ID.
);
```

**Attenzione:** se `productId` passa rapidamente tra valori, serve cleanup per evitare risultati vecchi. L'API di cleanup attraverso il terzo argomento della callback di `watch` funziona senza dipendere da `onWatcherCleanup` introdotto più recentemente. [Vue: watchers](https://vuejs.org/guide/essentials/watchers.html).

## Architettura e casi frequenti

| Esigenza | Scelta tipica | Da non confondere |
|---|---|---|
| Passare dati al figlio | props | non modificare una prop direttamente |
| Comunicare azioni al genitore | `emit` | non usarlo per dati globali persistenti |
| Valore calcolato | `computed` | non duplicarlo in `ref` + `watch` senza motivo |
| Stato locale | `ref`, `reactive` | `ref` necessita `.value` nello script |
| Stato condiviso tra molte pagine | Pinia | evita un mega-store per ogni piccolo form |
| Navigazione SPA | Vue Router | URL e parametri route non sono normali props, se non configurate |
| Logica riutilizzabile | composable `useProducts()` | è una funzione con state/hooks Vue, non un componente |
| Contenuto fornito dal genitore | `<slot />` | diverso da una prop stringa |
| Test UI | Vue Test Utils + Vitest | preferisci test di comportamento |

**`provide` / `inject`** è utile quando dati/configurazioni devono attraversare molti livelli: usa chiavi tipizzate con `InjectionKey`, ma non sostituire indiscriminatamente uno store globale. **Direttive** (`v-if`, `v-model`, `v-for`) operano nel template, mentre la logica di business rimane preferibilmente in funzioni/composables. **Options API** e Composition API possono convivere nella codebase; evita di mescolare stili nello stesso componente senza un motivo.

**Rendering in breve:** Vue traccia le dipendenze reattive; quando cambiano, programma l'aggiornamento e applica al DOM le modifiche necessarie. `nextTick()` aspetta il completamento del successivo aggiornamento DOM. Attenzione a `ref` vs `reactive` e alla perdita di reattività destrutturando oggetti: [Reactivity fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html).

## Domande da colloquio

**Vue vs React?** Vue usa template e sistema di reattività con `ref`/`computed`; React usa JSX, state e render dei componenti. Entrambi supportano composizione e stato condiviso.

**`ref` vs `reactive`?** `ref` incapsula qualunque tipo in `.value`; `reactive` rende reattivo un oggetto tramite proxy. Nei template Vue svolge alcune operazioni di unwrap automatico.

**`computed` vs `watch`?** Valore derivato e memorizzato vs esecuzione di un effetto collaterale al cambiare di una sorgente.

**Props vs emits?** Dati verso il figlio e notifiche verso il genitore. Evita la mutazione diretta delle props.

**Perché `:key` in `v-for`?** Fornisce un'identità stabile per riutilizzare e riordinare correttamente nodi/componenti.

**Composition vs Options API?** Entrambe supportate. Composition raggruppa logica per funzionalità e lavora bene con TypeScript; Options raggruppa per `data`, `methods`, `computed` ecc.

**Approfondisci quando serve:** [Vue: Introduction](https://vuejs.org/guide/introduction.html), [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html), [Props](https://vuejs.org/guide/components/props.html), [Computed](https://vuejs.org/guide/essentials/computed.html). Gli esempi Vue richiedono un progetto Vue/Vite: non si eseguono aprendo il `.md`.
