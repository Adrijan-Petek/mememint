import { expect } from "chai";

export async function expectRevert(promise, message) {
  try {
    await promise;
    throw new Error("Expected transaction to revert");
  } catch (err) {
    const errString = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    if (message) {
      expect(errString).to.include(message);
    }
  }
}

