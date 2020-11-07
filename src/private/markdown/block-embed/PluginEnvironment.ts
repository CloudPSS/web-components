/* eslint-disable */
// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.

'use strict';

import YouTubeService from './services/YouTubeService';
import VimeoService from './services/VimeoService';
import VineService from './services/VineService';
import PreziService from './services/PreziService';
import type VideoServiceBase from './services/VideoServiceBase';
import type { ServiceOption } from './services/VideoServiceBase';
import type MarkdownIt from 'markdown-it';
import BilibiliService from './services/BilibiliService';
import YoukuService from './services/YoukuService';
import TencentService from './services/TencentService';

export type PluginOptions = {
    containerClassName: string | null;
    serviceClassPrefix: string;
    outputPlayerSize: boolean;
    allowFullScreen: boolean;
    filterUrl?: (url: string, serviceName: string, videoID: string, options: object) => string;
    services?: Record<string, typeof VideoServiceBase>;
} & Record<string, ServiceOption>;

export default class PluginEnvironment {
    constructor(readonly md: MarkdownIt, readonly options: PluginOptions) {
        this.options = Object.assign(this.getDefaultOptions(), options);

        this._initServices();
    }

    _initServices() {
        let defaultServiceBindings = {
            youtube: YouTubeService,
            vimeo: VimeoService,
            vine: VineService,
            prezi: PreziService,
            bilibili: BilibiliService,
            youku: YoukuService,
            tencent: TencentService,
        };

        let serviceBindings = Object.assign({}, defaultServiceBindings, this.options.services);
        let services: Record<string, VideoServiceBase<ServiceOption>> = {};
        for (let serviceName of Object.keys(serviceBindings)) {
            let _serviceClass = serviceBindings[serviceName];
            services[serviceName] = new _serviceClass(serviceName, this.options[serviceName], this);
        }

        this.services = services;
    }

    services!: Record<string, VideoServiceBase<ServiceOption>>;
    getDefaultOptions() {
        return {
            containerClassName: 'block-embed',
            serviceClassPrefix: 'block-embed-service-',
            outputPlayerSize: true,
            allowFullScreen: true,
            filterUrl: null,
        };
    }
}
