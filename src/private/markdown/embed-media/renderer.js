// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import { elementVoid } from 'incremental-dom';
import '../../../embed-media';
import { sourceLineIncremental } from '../utils';

/**
 * @type {import('../incremental-dom').IncrementalRenderRule}
 */
function renderer(tokens, idx) {
    const videoToken = tokens[idx];
    const [service, videoID] = videoToken.info.split('\0');
    return () => {
        elementVoid(
            'cwe-embed-media',
            videoToken.info,
            [],
            'service',
            service,
            'srcid',
            videoID,
            ...sourceLineIncremental(videoToken),
        );
    };
}

export default renderer;
