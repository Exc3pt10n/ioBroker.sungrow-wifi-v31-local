# Development

Notes for contributors. User documentation: [README.md](README.md) (English) and [docs/de/README.md](docs/de/README.md) (German).

## Setup and checks

```bash
npm ci
npm run lint
npm test                   # unit and package tests
npm run test:integration   # adapter in a real js-controller test instance with a simulated WiFi dongle
```

## Quick test without ioBroker

`tools/test-dongle.js` reads the registers once and prints them:

```bash
node tools/test-dongle.js <dongle IP> [slave ID] [auto|on|off]
```

## Project structure

```
main.js                  adapter life cycle, poll loop, states
lib/sungrowModbus.js     Modbus TCP client incl. Sungrow key handshake and AES-128-ECB framing
lib/registers.js         register table, work state texts, decoding (U16/S16/U32/S32, low word first)
test/mockDongle.js       simulated WiFi dongle (plain and encrypted) for unit and integration tests
tools/test-dongle.js     command line check of a real dongle
admin/jsonConfig.json    instance settings (translated into all ioBroker languages)
```

## Protocol

Newer dongle firmware wraps Modbus TCP in AES-128-ECB. The session key is requested with an unencrypted
handshake (`GET_KEY`) and XORed with a fixed key. If the dongle answers with an all-zero or all-0xFF key, it speaks
plain Modbus TCP. The implementation follows the community library
[SungrowModbusTcpClient](https://github.com/rpvelloso/Sungrow-Modbus).

## Releases

Versioning, changelog and the release process are described in [CLAUDE.md](CLAUDE.md). Releases (tag, GitHub release
with `.tgz`, npm package) are created only by the workflow `.github/workflows/test-and-release.yml` after a merge to `main`.
