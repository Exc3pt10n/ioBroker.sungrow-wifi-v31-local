'use strict';

/**
 * Input registers of Sungrow string inverters (SG..K-D / SG..RS / SG..RT),
 * from "Communication Protocol of PV Grid-Connected String Inverters".
 * reg = documented (1-based) register number; protocol address = reg - 1.
 * U32/S32: low word first (Sungrow word order).
 */
const DATA_BLOCK = { start: 5000, count: 39 }; // 5000..5038

const REGISTERS = [
    { reg: 5000, id: 'deviceTypeCode', name: 'Device type code', type: 'U16', role: 'value' },
    { reg: 5001, id: 'nominalPower', name: 'Nominal power', type: 'U16', factor: 0.1, unit: 'kW', role: 'value' },
    { reg: 5003, id: 'dailyYield', name: 'Daily yield', type: 'U16', factor: 0.1, unit: 'kWh', role: 'value.energy' },
    { reg: 5004, id: 'totalYield', name: 'Total yield', type: 'U32', unit: 'kWh', role: 'value.energy' },
    { reg: 5006, id: 'runningTime', name: 'Running time', type: 'U32', unit: 'h', role: 'value' },
    { reg: 5008, id: 'temperature', name: 'Internal temperature', type: 'S16', factor: 0.1, unit: '°C', role: 'value.temperature' },
    { reg: 5011, id: 'mppt1Voltage', name: 'MPPT1 voltage', type: 'U16', factor: 0.1, unit: 'V', role: 'value.voltage' },
    { reg: 5012, id: 'mppt1Current', name: 'MPPT1 current', type: 'U16', factor: 0.1, unit: 'A', role: 'value.current' },
    { reg: 5013, id: 'mppt2Voltage', name: 'MPPT2 voltage', type: 'U16', factor: 0.1, unit: 'V', role: 'value.voltage' },
    { reg: 5014, id: 'mppt2Current', name: 'MPPT2 current', type: 'U16', factor: 0.1, unit: 'A', role: 'value.current' },
    { reg: 5017, id: 'dcPower', name: 'DC power', type: 'U32', unit: 'W', role: 'value.power' },
    { reg: 5019, id: 'gridVoltage', name: 'Grid voltage', type: 'U16', factor: 0.1, unit: 'V', role: 'value.voltage' },
    { reg: 5022, id: 'gridCurrent', name: 'Grid current', type: 'U16', factor: 0.1, unit: 'A', role: 'value.current' },
    { reg: 5031, id: 'activePower', name: 'AC active power', type: 'U32', unit: 'W', role: 'value.power' },
    { reg: 5033, id: 'reactivePower', name: 'Reactive power', type: 'S32', unit: 'var', role: 'value.power.reactive' },
    { reg: 5035, id: 'powerFactor', name: 'Power factor', type: 'S16', factor: 0.001, role: 'value' },
    { reg: 5036, id: 'gridFrequency', name: 'Grid frequency', type: 'U16', factor: 0.1, unit: 'Hz', role: 'value.frequency' },
    { reg: 5038, id: 'workState', name: 'Work state (code)', type: 'U16', role: 'value' },
];

const WORK_STATES = {
    0x0000: 'Running',
    0x8000: 'Stopped',
    0x1300: 'Key stop',
    0x1500: 'Emergency stop',
    0x1400: 'Standby',
    0x1200: 'Initial standby',
    0x1600: 'Starting',
    0x9100: 'Running with warning',
    0x8100: 'Derating',
    0x8200: 'Dispatch run',
    0x5500: 'Fault',
    0x2500: 'Communication fault',
};

function decode(regs, start, def) {
    const i = def.reg - start;
    let v;
    switch (def.type) {
        case 'U16':
            v = regs[i];
            break;
        case 'S16':
            v = regs[i] > 0x7fff ? regs[i] - 0x10000 : regs[i];
            break;
        case 'U32':
            v = regs[i + 1] * 0x10000 + regs[i];
            break;
        case 'S32': {
            const u = regs[i + 1] * 0x10000 + regs[i];
            v = u > 0x7fffffff ? u - 0x100000000 : u;
            break;
        }
    }
    if (def.factor) {
        v = Math.round(v * def.factor * 1000) / 1000;
    }
    return v;
}

module.exports = { DATA_BLOCK, REGISTERS, WORK_STATES, decode };
