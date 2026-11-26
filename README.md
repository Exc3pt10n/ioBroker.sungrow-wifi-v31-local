![Logo](admin/sungrow-wifi-v31-local.png)

# ioBroker.sungrow-wifi-v31-local

[![NPM version](https://img.shields.io/npm/v/iobroker.sungrow-wifi-v31-local.svg)](https://www.npmjs.com/package/iobroker.sungrow-wifi-v31-local)
[![Test and Release](https://github.com/Exc3pt10n/ioBroker.sungrow-wifi-v31-local/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/Exc3pt10n/ioBroker.sungrow-wifi-v31-local/actions/workflows/test-and-release.yml)

**Deutsche Beschreibung:** [docs/de/README.md](docs/de/README.md)

Reads [Sungrow](https://en.sungrowpower.com/) string inverters **locally** via Modbus TCP of the WiFi dongle, without any cloud.
Tested with a **SG3K6-D** and WiFi dongle firmware WiFi V31_001_247.

- Detects automatically whether the dongle uses the AES encryption of newer Sungrow firmware and then talks encrypted.
- Disconnects after every poll, because the dongles often allow only **one** connection at a time. A hanging connection would otherwise block all others.

## Requirements

- ioBroker with js-controller >= 6.0.11 and admin >= 7.6.20
- Node.js 22 or newer
- Sungrow string inverter with WiFi dongle in the same network

## Installation

Install the adapter in the ioBroker admin from the adapter list or with
*Adapters → Install from custom URL → npm* and the package name `iobroker.sungrow-wifi-v31-local`.
Then create an instance.

## Configuration

| Field | Meaning |
|---|---|
| IP address | IP address of the WiFi dongle. Assign a fixed address in your router. |
| Port / Slave ID | 502 / 1 |
| Encryption | "Detect automatically" (default), "Always encrypted" or "Off" |
| Poll interval | Default 30 s, 5 s to 3600 s |
| Keep connection open | Default off. Only enable it if no other program accesses the dongle. |

No other Modbus client may access the dongle at the same time, e.g. the ioBroker Modbus adapter or evcc.

## Data points

`sungrow-wifi-v31-local.0.inverter.*`

| Data point | Register | Unit |
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
| `workState` / `workStateText` | 5038 | code / text |
| `deviceTypeCode`, `nominalPower` | 5000, 5001 | –, kW |

`workStateText` contains the work state as English text, e.g. `Running`, `Standby`, `Stopped`, `Derating` or `Fault`.

`sungrow-wifi-v31-local.0.info.*`

| Data point | Meaning |
|---|---|
| `connection` | `true` while the inverter answers |
| `lastUpdate` | Time of the last successful poll |

The registers come from Sungrow's communication protocol for string inverters. They are input registers with the
documented numbers; the protocol address is the number minus 1. U32 values have the low word first.

At night the inverter is switched off and does not answer. `info.connection` is then `false`, the last values are kept.

## Credits

The encryption is reimplemented after the community library
[SungrowModbusTcpClient](https://github.com/rpvelloso/Sungrow-Modbus).

Development notes: [DEVELOPMENT.md](DEVELOPMENT.md)

## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### 0.6.0 (2026-11-26)
- (Exc3pt10n) **Breaking:** The adapter is now distributed via npm; installing from GitHub is no longer supported
- (Exc3pt10n) **Breaking:** Data point names, log messages and the texts in `inverter.workStateText` are now English (e.g. `Running` instead of `Betrieb`); adjust scripts that compare these texts
- (Exc3pt10n) **Breaking:** Requires js-controller 6.0.11 and admin 7.6.20
- (Exc3pt10n) Instance settings translated into all ioBroker languages
- (Exc3pt10n) Poll interval, port and slave ID are validated in the adapter as well
- (Exc3pt10n) `info.lastUpdate` is created on installation

Older entries: [CHANGELOG_OLD.md](CHANGELOG_OLD.md)

## License

MIT License, see [LICENSE](LICENSE)

Copyright (c) 2026 Exc3pt10n <kontakt@jansesoft.de>
