#!/usr/bin/env node
'use strict';
/*
 * Quick check of a Sungrow WiFi dongle without ioBroker.
 * Usage: node tools/test-dongle.js <IP> [slaveId] [auto|on|off]
 */
const { SungrowModbus } = require('../lib/sungrowModbus');
const { DATA_BLOCK, REGISTERS, WORK_STATES, decode } = require('../lib/registers');

(async () => {
    const [host, unit = '1', enc = 'auto'] = process.argv.slice(2);
    if (!host) {
        console.log('Usage: node tools/test-dongle.js <dongle IP> [slave ID] [auto|on|off]');
        process.exit(1);
    }
    const mb = new SungrowModbus({ host, unitId: parseInt(unit, 10), encryption: enc, timeout: 5000 });
    try {
        console.log(`Connecting to ${host}:502, slave ID ${unit}, encryption: ${enc} ...`);
        const regs = await mb.readRegisters(4, DATA_BLOCK.start - 1, DATA_BLOCK.count);
        console.log(`OK – ${mb.keyInfo}\n`);
        for (const d of REGISTERS) {
            const v = decode(regs, DATA_BLOCK.start, d);
            const extra = d.id === 'workState' ? ` (${WORK_STATES[v] || 'unknown'})` : '';
            console.log(`${String(d.reg).padEnd(6)} ${d.name.padEnd(24)} ${v} ${d.unit || ''}${extra}`);
        }
    } catch (err) {
        console.log(`ERROR: ${err.message}`);
        console.log(`Handshake: ${mb.keyInfo || '-'}`);
        console.log('Hints: the inverter does not answer in the dark; try other slave IDs (0, 1, 247).');
        process.exitCode = 1;
    } finally {
        mb.close();
    }
})();
