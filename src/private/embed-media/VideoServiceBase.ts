// Copyright (c) Rotorz Limited and portions by original markdown-it-video authors
// Licensed under the MIT license. See LICENSE file in the project root.
import { html } from 'lit';

/** 嵌入视频渲染 */
export default abstract class VideoService<T extends object = object> {
    constructor(readonly options: T = {} as T) {
        this.options = Object.assign(this.getDefaultOptions(), options);
    }
    /** 默认选项 */
    getDefaultOptions(): T {
        return {} as T;
    }
    /** 从 Markdown src 中解析视频 ID */
    abstract extractVideoID(reference: string): string | undefined;
    /** 获取视频资源连接 */
    abstract getVideoUrl(videoID: string): string;
    /** 获取视频分享连接，默认为 {@link getVideoUrl} */
    getVideoHref(videoID: string): string {
        return this.getVideoUrl(videoID);
    }
    /** 获取嵌入 lit 模板，默认使用 iframe 嵌套 {@link getVideoUrl} */
    getEmbedCode(videoID: string): unknown {
        const videoSrc = this.getVideoUrl(videoID);

        return html`<iframe
            frameborder="0"
            msallowfullscreen
            webkitallowfullscreen
            mozallowfullscreen
            allowfullscreen
            src=${videoSrc}
        ></iframe>`;
    }
}
