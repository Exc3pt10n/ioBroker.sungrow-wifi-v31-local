# ioBroker.sungrow-wifi-v31-local (Deutsch)

**English description:** [README.md](../../README.md)

Liest [Sungrow](https://en.sungrowpower.com/)-String-Wechselrichter **lokal** über Modbus TCP des WLAN-Sticks aus, ganz ohne Cloud.
Getestet mit einem **SG3K6-D** und WLAN-Stick mit Firmware WiFi V31_001_247.

- Erkennt automatisch, ob der Stick die AES-Verschlüsselung neuerer Sungrow-Firmware nutzt, und spricht dann verschlüsselt.
- Trennt nach jeder Abfrage, weil die Sticks oft nur **eine** Verbindung gleichzeitig zulassen. Eine hängende Verbindung blockiert sonst alle weiteren.

## Voraussetzungen

- ioBroker mit js-controller ≥ 6.0.11 und Admin ≥ 7.6.20
- Node.js 22 oder neuer
- Sungrow-String-Wechselrichter mit WLAN-Stick im selben Netzwerk

## Installation

In der ioBroker-Admin-Oberfläche aus der Adapterliste oder über
*Adapter → Installieren aus eigener URL → npm* mit dem Paketnamen `iobroker.sungrow-wifi-v31-local`.
Danach eine Instanz anlegen.

## Konfiguration

| Feld | Bedeutung |
|---|---|
| IP-Adresse | IP des WLAN-Sticks. Im Router fest zuweisen. |
| Port / Slave-ID | 502 / 1 |
| Verschlüsselung | „Automatisch erkennen“ (Standard), „Immer verschlüsselt“ oder „Aus“ |
| Abfrageintervall | Standard 30 s, 5 s bis 3600 s |
| Verbindung offen halten | Standard aus. Nur einschalten, wenn kein anderes Programm auf den Stick zugreift. |

Es darf kein anderer Modbus-Client gleichzeitig auf den Stick zugreifen, z. B. der ioBroker-Modbus-Adapter oder evcc.

## Datenpunkte

`sungrow-wifi-v31-local.0.inverter.*`

| Datenpunkt | Register | Einheit |
|---|---|---|
| `activePower` | 5031–5032 | W |
| `dcPower` | 5017–5018 | W |
| `dailyYield` | 5003 | kWh |
| `totalYield` | 5004–5005 | kWh |
| `mppt1Voltage` / `mppt1Current` | 5011 / 5012 | V / A |
| `mppt2Voltage` / `mppt2Current` | 5013 / 5014 | V / A |
| `gridVoltage` / `gridCurrent` | 5019 / 5022 | V / A |
| `gridFrequency` | 5036 | Hz |
| `temperature` | 5008 | °C |
| `powerFactor` | 5035 | |
| `reactivePower` | 5033–5034 | var |
| `runningTime` | 5006–5007 | h |
| `workState` / `workStateText` | 5038 | Code / Text |
| `deviceTypeCode`, `nominalPower` | 5000, 5001 | –, kW |

`workStateText` enthält den Betriebszustand als englischen Text:

| Text | Bedeutung |
|---|---|
| `Running` | Betrieb |
| `Running with warning` | Betrieb mit Warnung |
| `Derating` | Leistungsreduzierung |
| `Dispatch run` | Netzbetreiber-Abregelung |
| `Starting` | Startet |
| `Standby` / `Initial standby` | Standby / Initialer Standby |
| `Stopped` / `Key stop` | Gestoppt / Gestoppt (Taste) |
| `Emergency stop` | Notaus |
| `Fault` / `Communication fault` | Fehler / Kommunikationsfehler |

`sungrow-wifi-v31-local.0.info.*`

| Datenpunkt | Bedeutung |
|---|---|
| `connection` | `true`, solange der Wechselrichter antwortet |
| `lastUpdate` | Zeitpunkt der letzten erfolgreichen Abfrage |

Die Register stammen aus Sungrows Protokoll für String-Wechselrichter. Es sind Input-Register mit den dokumentierten
Nummern; die Protokolladresse ist die Nummer minus 1. U32-Werte stehen mit dem niederwertigen Wort zuerst.

Nachts ist der Wechselrichter aus und antwortet nicht. `info.connection` steht dann auf `false`, die letzten Werte bleiben erhalten.

## Danksagung

Die Verschlüsselung ist nach der Community-Bibliothek
[SungrowModbusTcpClient](https://github.com/rpvelloso/Sungrow-Modbus) nachgebaut.
