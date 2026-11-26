'use strict';

const utils = require('@iobroker/adapter-core');
const { SungrowModbus } = require('./lib/sungrowModbus');
const { DATA_BLOCK, REGISTERS, WORK_STATES, decode } = require('./lib/registers');

const MIN_INTERVAL_S = 5;
const MAX_INTERVAL_S = 3600;

/**
 * Parse a configuration value as integer and fall back to a default if it is missing or out of range.
 *
 * @param {unknown} value
 * @param {number} min
 * @param {number} max
 * @param {number} def
 * @returns {number}
 */
function intInRange(value, min, max, def) {
    const n = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (!Number.isInteger(n)) {
        return def;
    }
    return Math.min(max, Math.max(min, n));
}

class SungrowWifiV31Local extends utils.Adapter {
    constructor(options = {}) {
        super({ ...options, name: 'sungrow-wifi-v31-local' });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.pollTimer = null;
        this.createdStates = new Set();
        this.online = null;
    }

    async onReady() {
        await this.setStateAsync('info.connection', false, true);
        const c = this.config;
        if (!c.host) {
            this.log.error('Please enter the IP address of the WiFi dongle in the instance settings.');
            return;
        }
        this.mb = new SungrowModbus({
            host: String(c.host).trim(),
            port: intInRange(c.port, 1, 65535, 502),
            unitId: intInRange(c.unitId, 0, 247, 1),
            timeout: 5000,
            encryption: ['auto', 'on', 'off'].includes(c.encryption) ? c.encryption : 'auto',
        });
        // Validated here as well, not only in the admin UI: 5 s ... 1 h
        this.interval = intInRange(c.interval, MIN_INTERVAL_S, MAX_INTERVAL_S, 30) * 1000;
        await this.extendObjectAsync('inverter', { type: 'channel', common: { name: 'Inverter' }, native: {} });
        await this.poll();
    }

    async ensureState(id, common) {
        if (this.createdStates.has(id)) {
            return;
        }
        await this.extendObjectAsync(id, {
            type: 'state',
            common: { read: true, write: false, ...common },
            native: {},
        });
        this.createdStates.add(id);
    }

    async poll() {
        this.pollTimer = null;
        let ok = false;
        try {
            const regs = await this.mb.readRegisters(4, DATA_BLOCK.start - 1, DATA_BLOCK.count);
            if (this.online !== true) {
                this.log.info(`Connected to ${this.mb.host}: ${this.mb.keyInfo}`);
            }
            for (const def of REGISTERS) {
                const val = decode(regs, DATA_BLOCK.start, def);
                const id = `inverter.${def.id}`;
                await this.ensureState(id, { name: def.name, type: 'number', role: def.role, unit: def.unit });
                await this.setStateAsync(id, val, true);
                if (def.id === 'workState') {
                    await this.ensureState('inverter.workStateText', { name: 'Work state', type: 'string', role: 'text' });
                    await this.setStateAsync('inverter.workStateText', WORK_STATES[val] || `Unknown (0x${val.toString(16)})`, true);
                }
            }
            await this.setStateAsync('info.lastUpdate', Date.now(), true);
            ok = true;
        } catch (err) {
            // At night the inverter is unpowered and cannot answer: log once, not every poll
            if (this.online !== false) {
                this.log.warn(`No data from inverter (${this.mb.keyInfo || 'no handshake'}): ${err.message}`);
            } else {
                this.log.debug(`Still no data: ${err.message}`);
            }
        }
        if (this.online !== ok) {
            this.online = ok;
            await this.setStateAsync('info.connection', ok, true);
        }
        if (!ok || !this.config.keepConnection) {
            this.mb.close(); // free the dongle's single Modbus slot for other clients
        }
        this.pollTimer = this.setTimeout(() => this.poll(), ok ? this.interval : Math.max(this.interval, 60000));
    }

    onUnload(callback) {
        try {
            if (this.pollTimer) {
                this.clearTimeout(this.pollTimer);
            }
            if (this.mb) {
                this.mb.close();
            }
        } finally {
            callback();
        }
    }
}

if (require.main !== module) {
    module.exports = options => new SungrowWifiV31Local(options);
} else {
    new SungrowWifiV31Local();
}
