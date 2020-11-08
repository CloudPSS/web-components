// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import renderer from './renderer';
import tokenizer from './tokenizer';

function setup(md) {
    md.block.ruler.before('fence', 'video', tokenizer, {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.renderer.rules['video'] = renderer;
}

export default setup;
