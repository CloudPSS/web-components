/* eslint-disable */
// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import { elementClose, elementOpen, elementVoid } from 'incremental-dom';
import Token from 'markdown-it/lib/token';
import { sourceLineIncremental } from '../../utils';
import type PluginEnvironment from '../PluginEnvironment';

function defaultUrlFilter(url: string) {
    return url;
}

export interface ServiceOption {
    width?: number;
    height?: number;
}

export default class VideoServiceBase<T extends ServiceOption = ServiceOption> {
    constructor(readonly name: string, readonly options: T, readonly env: PluginEnvironment) {
        this.name = name;
        this.options = Object.assign(this.getDefaultOptions(), options);
        this.env = env;
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

    getFilteredVideoUrl(videoID: string) {
        let filterUrlDelegate =
            typeof this.env.options.filterUrl === 'function' ? this.env.options.filterUrl : defaultUrlFilter;
        let videoUrl = this.getVideoUrl(videoID);
        return filterUrlDelegate(videoUrl, this.name, videoID, this.env.options);
    }

    getEmbedCode(videoID: string, videoToken: Token) {
        const videoSrc = this.getFilteredVideoUrl(videoID);

        const containerClassNames: string[] = [];
        if (this.env.options.containerClassName) {
            containerClassNames.push(this.env.options.containerClassName);
        }

        containerClassNames.push(this.env.options.serviceClassPrefix + this.name);

        const iframeAttributeList: unknown[] = [];
        iframeAttributeList.push('type', 'text/html');
        iframeAttributeList.push('src', videoSrc);
        iframeAttributeList.push('frameborder', 0);

        if (this.env.options.outputPlayerSize === true) {
            if (this.options.width !== undefined && this.options.width !== null) {
                iframeAttributeList.push(['width', this.options.width]);
            }
            if (this.options.height !== undefined && this.options.height !== null) {
                iframeAttributeList.push(['height', this.options.height]);
            }
        }

        if (this.env.options.allowFullScreen === true) {
            iframeAttributeList.push('webkitallowfullscreen', '');
            iframeAttributeList.push('mozallowfullscreen', '');
            iframeAttributeList.push('allowfullscreen', '');
        }

        return () => {
            elementOpen(
                'div',
                videoSrc,
                [],
                'class',
                containerClassNames.join(' '),
                'data-src',
                new URL(videoSrc, document.baseURI).href,
                'data-video-service',
                this.name,
                'data-video-id',
                videoID,
                ...sourceLineIncremental(videoToken),
            );
            elementVoid('iframe', videoSrc, [], ...iframeAttributeList);
            elementClose('div');
        };
    }
}
