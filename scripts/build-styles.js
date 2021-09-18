const { promisify } = require('util');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const postcss = require('postcss');
const sass = require('sass');

const SRC = path.resolve(__dirname, '../src');

const processor = postcss.default([require('cssnano')(), require('postcss-preset-env')()]);

async function main() {
    const matches = await promisify(glob)('**/*.{scss,sass,css}', { cwd: SRC });
    for (const css of matches) {
        if (path.basename(css).startsWith('_')) {
            continue;
        }

        console.log(css);
        const file = path.resolve(SRC, css);
        const out = file + '.style.js';

        const content =
            path.extname(file) === '.css'
                ? await fs.readFile(file, 'utf-8')
                : (await promisify(sass.render)({ file: file })).css;

        const result = await processor.process(content, { from: css, to: out });
        fs.writeFile(
            out,
            `/* eslint-disable */
/** GENERATED OUTPUT  source: ${css} **/
import { css } from 'lit-element';

export default css\`${result}\`;
`,
        );
    }
}

main();
