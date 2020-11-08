/* eslint-disable */
// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
import { html } from 'lit-element';

export default class VideoServiceBase<T extends object = object> {
    constructor(readonly options: T = {} as T) {
        this.options = Object.assign(this.getDefaultOptions(), options);
    }
    getDefaultOptions(): T {
        return {} as T;
    }
    extractVideoID(reference: string): string {
        return reference;
    }
    getVideoUrl(videoID: string): string {
        throw new Error('not implemented');
    }
    getEmbedCode(videoID: string) {
        const videoSrc = this.getVideoUrl(videoID);

        return html`<iframe
            frameborder="0"
            webkitallowfullscreen
            mozallowfullscreen
            allowfullscreen
            src=${videoSrc}
        ></iframe>`;
    }
}
