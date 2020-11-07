// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import VideoServiceBase from './VideoServiceBase';

class YouTubeService extends VideoServiceBase {
    getDefaultOptions() {
        return { width: 640, height: 390 };
    }

    extractVideoID(reference) {
        let match = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/.exec(reference);
        return match && match[7].length === 11 ? match[7] : reference;
    }

    getVideoUrl(videoID) {
        return `//www.youtube.com/embed/${videoID}`;
    }
}

export default YouTubeService;
