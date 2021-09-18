const fs = require('fs-extra');
const path = require('path');

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

const ROOT = path.resolve(__dirname, '..');

async function main() {
    await fs.remove(path.resolve(ROOT, './publish/tsconfig.tsbuildinfo'));
    await fs.remove(path.resolve(ROOT, './publish/tsconfig.json'));
    await fs.remove(path.resolve(ROOT, './publish/tsconfig.check.json'));
}

main();
