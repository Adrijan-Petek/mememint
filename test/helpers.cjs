const { expect } = require("chai");

async function expectRevert(promise, message) {
  try {
    await promise;
    throw new Error("Expected transaction to revert");
  } catch (err) {
    const errString = err && err.message ? `${err.name || "Error"}: ${err.message}` : String(err);
    if (message) {
      expect(errString).to.include(message);
    }
  }
}

module.exports = { expectRevert };

