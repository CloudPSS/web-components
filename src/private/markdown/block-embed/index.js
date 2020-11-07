// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import PluginEnvironment from './PluginEnvironment';
import renderer from './renderer';
import tokenizer from './tokenizer';

function setup(md, options) {
    let env = new PluginEnvironment(md, options);

    md.block.ruler.before('fence', 'video', tokenizer.bind(env), {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
    });
    md.renderer.rules['video'] = renderer.bind(env);
}

export default setup;
