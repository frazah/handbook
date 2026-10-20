<!-- level: Biosecurity -->
<!-- summary: Dati genetici, diritti, valutazione clinica e human oversight -->
# Dati sensibili, etica e validazione prima dell'uso

Dati genetici, biomedici e clinici possono essere **estremamente sensibili**, anche se pseudonimizzati.  
Rischi tipici: re-identificazione, inferenze involontarie, discriminazione, trasferimenti non autorizzati e conservazione eccessiva.

## Checklist data governance

- Scopo definito e base legittima per il trattamento.
- Dati minimi necessari e politiche di accesso.
- Separazione tra identificatori e analisi quando appropriato.
- Cifratura, audit, retention e processo di cancellazione.
- Condizioni di licenza e permessi per dataset pubblici o controllati.
- Revisione con esperti di privacy, etica e regolamentazione nel contesto pertinente.

## Valutare un modello AI prima di usarlo

## Prima del codice: cosa riconoscere

Dati clinici e genetici possono essere sensibili e difficilmente anonimizzabili. Minimizza accessi e conservazione; separa consenso, base giuridica e valutazione scientifica.

```text
performance offline → validazione esterna → analisi di bias
                    → analisi rischio/beneficio → valutazione prospettica
                    → supervisione umana + monitoraggio
```

Verifica: popolazione target, tassi di falsi positivi/negativi, impatto sui diversi gruppi, drift, conseguenze degli errori e possibilità di contestazione.  
L'evidenza di utilità clinica richiede molto più di un buon benchmark.

**Non usare** un progetto dimostrativo per consigliare diagnosi, farmaci o interventi sanitari individuali.

Fonti: [OMS — Ethics and governance of AI for health](https://www.who.int/publications-detail-redirect/9789240084759) · [GDPR sul portale EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj).
