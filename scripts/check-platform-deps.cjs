#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function joinFromRepoRoot(...parts) {
  return path.join(__dirname, "..", ...parts);
}

function checkLightningCss() {
  const lightningRoot = joinFromRepoRoot("node_modules", "lightningcss");
  if (!exists(lightningRoot)) return;

  let expectedPackage = null;
  let platformLabel = null;

  if (process.platform === "linux") {
    const { MUSL, familySync } = require("detect-libc");
    const family = familySync();
    const libc =
      family === MUSL ? "musl" : process.arch === "arm" ? "gnueabihf" : "gnu";
    expectedPackage = `lightningcss-linux-${process.arch}-${libc}`;
    platformLabel = `linux-${process.arch}-${libc}`;
  } else if (process.platform === "darwin") {
    expectedPackage = `lightningcss-darwin-${process.arch}`;
    platformLabel = `darwin-${process.arch}`;
  } else if (process.platform === "win32") {
    expectedPackage = `lightningcss-win32-${process.arch}-msvc`;
    platformLabel = `win32-${process.arch}-msvc`;
  }

  if (!expectedPackage) return;

  const expectedPath = joinFromRepoRoot("node_modules", expectedPackage);
  if (exists(expectedPath)) return;

  const otherPlatformInstalled =
    process.platform !== "win32" &&
    exists(joinFromRepoRoot("node_modules", "lightningcss-win32-x64-msvc"));

  console.error("");
  console.error("Native dependency mismatch detected.");
  console.error(
    `- Missing: node_modules/${expectedPackage} (needed for ${platformLabel})`
  );
  if (otherPlatformInstalled) {
    console.error(
      "- Found a Windows build of lightningcss; node_modules may have been copied from another OS."
    );
  }
  console.error("");
  console.error("Fix:");
  console.error("- Delete node_modules and reinstall on this machine:");
  console.error("  rm -rf node_modules");
  console.error("  npm ci");
  console.error("");
  process.exit(1);
}

checkLightningCss();

