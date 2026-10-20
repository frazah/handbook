<!-- level: Prevenzione -->
<!-- summary: Incidenza, prevalenza, rischio, bias e misure di popolazione -->
# Epidemiologia: studiare la salute delle popolazioni

L'**epidemiologia** studia distribuzione e determinanti di condizioni di salute e fornisce evidenze per prevenzione e sanità pubblica.  
L'unità spesso è una **popolazione definita**, non il singolo paziente.

| Misura | Domanda | Distinzione importante |
| --- | --- | --- |
| Incidenza | Quanti **nuovi** eventi in un periodo? | Richiede persone a rischio e intervallo adeguato |
| Prevalenza | Quante persone **hanno** la condizione in un momento/periodo? | Dipende anche dalla durata |
| Mortalità | Quanti decessi secondo definizione e periodo? | Specifica il denominatore |
| Letalità | Tra i casi definiti, quanti muoiono? | Sensibile a chi viene identificato |
| Rischio relativo | Quanto cambia il rischio tra gruppi? | Non equivale al rischio assoluto |

## Esempio con numeri inventati

Se in un territorio di **20.000 residenti** ci sono **40 nuove segnalazioni** nel periodo, il tasso grezzo riportato per quel periodo è **20 per 10.000 residenti**.  
Questo è solo un rapporto descrittivo: non è automaticamente una vera incidenza epidemiologica se il denominatore e la definizione dei casi non sono appropriati.

## Prima del codice: cosa riconoscere

**Incidenza**: nuovi casi nel tempo in una popolazione a rischio; **prevalenza**: casi presenti. Per confrontare gruppi servono definizioni coerenti di tempo, popolazione e misura.

```python
segnalazioni = 40
popolazione = 20_000
segnalazioni_x_10k = segnalazioni / popolazione * 10_000
print(segnalazioni_x_10k)  # 20.0
```

**Attenzione:** un aumento di segnalazioni può riflettere più test, accesso ai servizi, nuova definizione del caso o un cambiamento effettivo del fenomeno.
