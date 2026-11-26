"use strict";

const { expect } = require("chai");
const { DATA_BLOCK, REGISTERS, WORK_STATES, decode } = require("./registers");
const { DEFAULT_REGISTERS } = require("../test/mockDongle");

const block = Array.from({ length: DATA_BLOCK.count }, (_, i) => DEFAULT_REGISTERS[DATA_BLOCK.start + i] || 0);
const value = (id) => decode(block, DATA_BLOCK.start, REGISTERS.find((r) => r.id === id));

describe("registers", () => {
  it("all registers are inside the polled block", () => {
    for (const r of REGISTERS) {
      const width = r.type.endsWith("32") ? 2 : 1;
      expect(r.reg, r.id).to.be.at.least(DATA_BLOCK.start);
      expect(r.reg + width - 1, r.id).to.be.below(DATA_BLOCK.start + DATA_BLOCK.count);
    }
  });

  it("data point IDs are unique", () => {
    const ids = REGISTERS.map((r) => r.id);
    expect(new Set(ids).size).to.equal(ids.length);
  });

  it("U16 with factor", () => {
    expect(value("nominalPower")).to.equal(3.6);
    expect(value("dailyYield")).to.equal(12.5);
    expect(value("gridVoltage")).to.equal(233.8);
    expect(value("gridFrequency")).to.equal(50);
  });

  it("U32 with low word first", () => {
    expect(value("totalYield")).to.equal(100000);
    expect(value("activePower")).to.equal(2950);
  });

  it("signed values", () => {
    expect(value("temperature")).to.equal(-2);
    expect(value("reactivePower")).to.equal(-1);
  });

  it("work states have texts", () => {
    expect(WORK_STATES[value("workState")]).to.equal("Running");
    expect(WORK_STATES[0x1200]).to.equal("Initial standby");
  });
});
