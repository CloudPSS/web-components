/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CSSResultArray, customElement, html, state, LitElement, property, TemplateResult } from 'lit-element';
import BilibiliService from './private/embed-media/BilibiliService';
import PreziService from './private/embed-media/PreziService';
import TencentService from './private/embed-media/TencentService';
import VideoServiceBase from './private/embed-media/VideoServiceBase';
import VimeoService from './private/embed-media/VimeoService';
import VineService from './private/embed-media/VineService';
import YoukuService from './private/embed-media/YoukuService';
import YouTubeService from './private/embed-media/YouTubeService';
import styles from './embed-media.scss.style.js';

/**
 * 媒体组件
 */
@customElement('cwe-embed-media')
export class EmbedMediaElement extends LitElement {
    /**
     * @inheritdoc
     */
    static get styles(): CSSResultArray {
        return super.styles ? [super.styles, styles] : [styles];
    }
    constructor() {
        super();
    }
    /** 监听视窗变化 */
    private static readonly __observe = new IntersectionObserver(
        (intersections) => {
            intersections.forEach((e) => {
                (e.target as EmbedMediaElement).intersecting = e.intersectionRatio > 0;
            });
        },
        {
            rootMargin: '1000px',
        },
    );
    /**
     * @inheritdoc
     */
    connectedCallback(): void {
        EmbedMediaElement.__observe.observe(this);
        super.connectedCallback();
    }
    /**
     * @inheritdoc
     */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        EmbedMediaElement.__observe.unobserve(this);
        this.intersecting = false;
        this.load = false;
    }
    /** 加载内容 */
    @state() private load = false;
    /** 显示内容 */
    @state() private intersecting = false;
    /** 媒体服务名称 */
    @property({ reflect: true }) service?: string;
    /** 媒体 ID */
    @property({ reflect: true }) srcid?: string;
    /** 媒体源 */
    private __src?: string;
    /** 媒体源 */
    get src(): string | undefined {
        return this.__src;
    }
    /**
     * @inheritdoc
     */
    render(): TemplateResult {
        if (this.intersecting) {
            this.load = true;
        }
        if (this.srcid && this.service) {
            const service = EmbedMediaElement.services[this.service];
            if (service) {
                this.srcid = service.extractVideoID(this.srcid);
                return this.load
                    ? this.renderTemplate(
                          new URL(service.getVideoUrl(this.srcid), this.baseURI).href,
                          service.getEmbedCode(this.srcid),
                      )
                    : this.renderTemplate();
            }
        }
        return this.renderTemplate();
    }

    /**
     * 骨架
     */
    private renderTemplate(src?: string, data?: unknown): TemplateResult {
        this.__src = src ? src : undefined;
        if (src) {
            this.setAttribute('src', src);
            this.__src = src;
        } else {
            this.removeAttribute('src');
            this.__src = undefined;
            src = '';
        }
        return html`<div id="container" aria-labelledby="info">${data}</div>
            <div id="info">${src}</div>`;
    }

    /** 注册的服务 */
    static services: Record<string, VideoServiceBase | undefined> = {
        youtube: new YouTubeService(),
        vimeo: new VimeoService(),
        vine: new VineService(),
        prezi: new PreziService(),
        bilibili: new BilibiliService(),
        youku: new YoukuService(),
        tencent: new TencentService(),
    };
}

declare global {
    /**
     * @inheritdoc
     */
    interface HTMLElementTagNameMap {
        /**
         * @inheritdoc
         */
        'cwe-embed-media': EmbedMediaElement;
    }
}
