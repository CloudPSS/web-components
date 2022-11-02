// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import VideoServiceBase from './VideoServiceBase.js';

/**
 * PreziService
 */
class PreziService extends VideoServiceBase<{ width: number; height: number }> {
    /** @inheritdoc */
    override getDefaultOptions(): { width: number; height: number } {
        return { width: 550, height: 400 };
    }

    /** @inheritdoc */
    override extractVideoID(reference: string): string {
        const match = /^https:\/\/prezi.com\/(.[^/]+)/.exec(reference);
        return match ? match[1] : reference;
    }

    /** @inheritdoc */
    override getVideoUrl(videoID: string): string {
        return (
            'https://prezi.com/embed/' +
            videoID +
            '/?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=0&amp;autohide_ctrls=0&amp;' +
            'landing_data=bHVZZmNaNDBIWnNjdEVENDRhZDFNZGNIUE43MHdLNWpsdFJLb2ZHanI5N1lQVHkxSHFxazZ0UUNCRHloSXZROHh3PT0&amp;' +
            'landing_sign=1kD6c0N6aYpMUS0wxnQjxzSqZlEB8qNFdxtdjYhwSuI'
        );
    }
    /** @inheritdoc */
    override getVideoHref(videoID: string): string {
        return 'https://prezi.com/' + videoID;
    }
}

export default PreziService;
