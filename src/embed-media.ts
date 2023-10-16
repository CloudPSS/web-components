/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CSSResultArray, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import BilibiliService from './private/embed-media/BilibiliService.js';
import PreziService from './private/embed-media/PreziService.js';
import TencentService from './private/embed-media/TencentService.js';
import VideoService from './private/embed-media/VideoServiceBase.js';
import VimeoService from './private/embed-media/VimeoService.js';
import VineService from './private/embed-media/VineService.js';
import YoukuService from './private/embed-media/YoukuService.js';
import YouTubeService from './private/embed-media/YouTubeService.js';
import styles from './embed-media.scss?lit';

export { VideoService };

/**
 * 媒体组件
 */
@customElement('cwe-embed-media')
export class EmbedMediaElement extends LitElement {
    /**
     * @inheritdoc
     */
    static override get styles(): CSSResultArray {
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
    override connectedCallback(): void {
        EmbedMediaElement.__observe.observe(this);
        super.connectedCallback();
    }
    /**
     * @inheritdoc
     */
    override disconnectedCallback(): void {
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
    /** 媒体链接 */
    private __href?: string;
    /** 媒体链接 */
    get href(): string | undefined {
        return this.__href;
    }
    /**
     * @inheritdoc
     */
    protected override render(): TemplateResult {
        if (this.intersecting) {
            this.load = true;
        }
        if (this.srcid && this.service) {
            const service = EmbedMediaElement.services[this.service];
            if (service) {
                this.srcid = service.extractVideoID(this.srcid);
                return this.srcid && this.load
                    ? this.renderTemplate(
                          new URL(service.getVideoUrl(this.srcid), this.baseURI).href,
                          service.getEmbedCode(this.srcid),
                          new URL(service.getVideoHref(this.srcid), this.baseURI).href,
                      )
                    : this.renderTemplate();
            }
        }
        return this.renderTemplate();
    }

    /**
     * 骨架
     */
    private renderTemplate(src?: string, data?: unknown, href?: string): TemplateResult {
        if (src) {
            this.setAttribute('src', src);
            this.__src = src;
        } else {
            this.removeAttribute('src');
            this.__src = undefined;
            src = '';
        }
        if (href) {
            this.setAttribute('href', href);
            this.__href = href;
        } else {
            this.removeAttribute('href');
            this.__href = undefined;
            href = '';
        }
        const random = Math.random().toString(36).slice(2);
        return html`<div class="container" aria-labelledby="info-${random}">${data}</div>
            <div id="info-${random}" class="info">${href}</div>`;
    }

    /** 注册的服务 */
    static readonly services: Record<string, VideoService | undefined> = {
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
