const fs = require('fs-extra');
const path = require('path');

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the compiled js files in the root of the package.
// It will not be included in the npm package.

async function main() {
    const source = await fs.readFile(path.resolve(__dirname, './package.json'), 'utf-8');
    const sourceObj = JSON.parse(source);
    sourceObj.scripts = undefined;
    sourceObj.devDependencies = undefined;
    await fs.writeFile(path.resolve(__dirname, './publish/package.json'), JSON.stringify(sourceObj, null, 2), 'utf-8');
    await copy('./src');
    await copy('./README.md');
    await copy('./LICENSE');
    await fs.remove('./publish/tsconfig.tsbuildinfo');
}

async function copy(file) {
    await fs.copy(path.resolve(__dirname, file), path.resolve(__dirname, './publish/', file));
}

main();
