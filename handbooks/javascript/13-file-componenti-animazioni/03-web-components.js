'use strict';
// JAVASCRIPT HANDBOOK 13.3 — Custom Elements, Shadow DOM, template, slot
// Fonte: https://javascript.info/web-components
(() => {
  if (typeof customElements === 'undefined') return;
  // Web components = elementi HTML custom, encapsulation via Shadow DOM.
  class NoticeBox extends HTMLElement {
    connectedCallback() {

      // Callback quando entra nel documento; attenzione a connessioni ripetute.
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: 'open' });
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <style>:host { display:block; border:1px solid gray; padding:.5rem; }
          ::slotted(*) { font-weight:bold; }</style>
        <slot>Contenuto predefinito</slot>`;
      shadow.append(wrapper);
      // Markup STATICO di progetto; per dati utente usa textContent.
    }
  }
  if (!customElements.get('notice-box')) {
    customElements.define('notice-box', NoticeBox);
  }
  // HTML: <notice-box><span>Messaggio</span></notice-box>
  // <template> mantiene markup inattivo finche' non viene clonato.
  // Slots proiettano contenuto LIGHT DOM nel componente.
  // Eventi possono essere retargeted oltre il confine Shadow DOM;
  // event.composedPath() permette di ispezionare il percorso.
})();
