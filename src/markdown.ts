import { PropertyValues, ReactiveElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type MarkdownIt from 'markdown-it';
import markdownIt from './private/markdown/index.js';
import type * as markdownItIncrementalDOM from './private/markdown/incremental-dom';
import { postRender } from './private/markdown/post-render.js';
import { style } from './config.js';
import * as IncrementalDOM from 'incremental-dom';
import styles from './markdown.scss';

/** Markdown 选项 */
export interface MarkdownRenderOptions extends MarkdownIt.Options {
    /** 读取到 frontMatter 的回调 */
    frontMatter?: (fm: string) => void;
    /** 文档路径，用于解析文档中的相对路径链接 */
    documentSrc?: URL;
}

/** Markdown 渲染 */
export type MarkdownRenderer = (options?: MarkdownRenderOptions) => markdownItIncrementalDOM.IncrementalMarkdownIt;

const defaultRenderer: MarkdownRenderer = (options = {}) => {
    const src = options.documentSrc;
    const md = markdownIt(options);
    const normalizeLink = md.normalizeLink.bind(md);
    md.normalizeLink = (url: string): string => {
        if (!src) return normalizeLink(url);
        const u = new URL(url, src);
        if (u.origin === src?.origin) {
            u.pathname.replace(/(\/index)?\.md$/i, '');
        }
        return normalizeLink(u.href);
    };
    md.validateLink = () => true;
    return md;
};

/**
 * Markdown 组件
 * @event render
 * @event navigate
 */
@customElement('cwe-markdown')
export class MarkdownElement extends ReactiveElement {
    static renderer = defaultRenderer;

    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        this.elBaseStyle = document.createElement('style');
        this.elUserStyle = document.createElement('style');
        this.elArticle = document.createElement('article');
        root.append(this.elBaseStyle, this.elUserStyle, this.elArticle);

        this.elBaseStyle.textContent = style(this) + '\n' + styles.cssText;
        this.elArticle.addEventListener('click', this.onClick.bind(this));
    }

    /** 基础样式 */
    private readonly elBaseStyle: HTMLStyleElement;
    /** 用户样式 */
    private readonly elUserStyle: HTMLStyleElement;
    /** 渲染结果 */
    private readonly elArticle: HTMLElementTagNameMap['article'];
    /** 文档路径，用于解析文档中的相对路径链接 */
    @property({
        reflect: true,
        converter: (value) => {
            if (value == null) return null;
            return new URL(value ?? '', document.baseURI).href;
        },
    })
    src?: string | null;
    /** 文档内容 */
    @property({ reflect: true }) srcdoc?: string;
    /** 附加样式 */
    @property({ reflect: true }) docStyle?: string;
    /** 附加样式 */
    @property({ reflect: true }) mode?: 'inline' | 'block';
    /**
     * @inheritdoc
     */
    protected override update(changedProperties: PropertyValues): void {
        super.update(changedProperties);

        if (
            changedProperties.has('srcdoc') ||
            changedProperties.has('src') ||
            changedProperties.has('mode') ||
            changedProperties.size === 0
        ) {
            let frontMatter: string | undefined;
            const src = new URL(this.src ?? document.location.href, document.baseURI);
            const doc = String(this.srcdoc ?? '');
            const md = ((this.constructor as typeof MarkdownElement).renderer ?? defaultRenderer)({
                frontMatter: (fm) => (frontMatter = fm),
                documentSrc: src,
            });
            const rendered =
                md[this.mode === 'inline' ? 'renderInlineToIncrementalDOM' : 'renderToIncrementalDOM'](doc);
            this.__frontMatter = frontMatter;

            IncrementalDOM.patch(this.elArticle, rendered);
            postRender(this.elArticle);
            this.dispatchEvent(new CustomEvent('render'));
        }

        if (changedProperties.has('docStyle') || changedProperties.size === 0) {
            this.elUserStyle.textContent = this.docStyle ?? null;
        }
    }

    /**
     * 监听点击事件
     */
    onClick(ev: Event): void {
        const target = ev.target as HTMLElement;
        const link = target.closest<HTMLAnchorElement>('a[href]');
        if (link) {
            const event = new CustomEvent('navigate', {
                detail: link.href,
                bubbles: true,
                composed: true,
                cancelable: true,
            });
            ev.preventDefault();
            if (!this.dispatchEvent(event)) return;
            const target = new URL(link.href);
            const source = new URL(this.src ?? '', document.baseURI);
            if (source.origin !== target.origin) {
                window.open(target.href, '_blank', 'noopener');
                return;
            }
            if (source.pathname !== target.pathname || source.search !== target.search) {
                location.assign(target.href);
                return;
            }
            const targetHash = target.hash;
            if (targetHash.length <= 1) {
                location.assign(target.href);
                return;
            }
            const targetItem = this.elArticle.querySelector(
                '#' +
                    [...decodeURIComponent(targetHash).slice(1)]
                        .map((c) => '\\' + (c.codePointAt(0) ?? 0).toString(16).padStart(6, '0'))
                        .join(''),
            );
            if (!targetItem) {
                location.assign(target.href);
                return;
            }
            targetItem.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 标题
     */
    get headers(): Array<{
        id: string;
        title: string;
        level: number;
        element: HTMLHeadingElement;
    }> {
        return Array.from(this.elArticle.children)
            .filter((i): i is HTMLHeadingElement => i instanceof HTMLHeadingElement)
            .map((h) => {
                return {
                    id: h.id,
                    title: h.innerText,
                    level: Number.parseInt(h.tagName.slice(1)),
                    element: h,
                };
            });
    }
    /** frontMatter */
    __frontMatter?: string;
    /**
     * frontMatter
     */
    get frontMatter(): string | undefined {
        return this.__frontMatter;
    }

    /**
     * 文本内容
     */
    get text(): string {
        return this.elArticle.innerText;
    }

    /**
     * HTML 内容
     */
    get html(): string {
        return this.elArticle.outerHTML;
    }
}

declare global {
    /**
     * @inheritdoc
     */
    interface HTMLElementTagNameMap {
        /**
         * @inheritdoc
         */
        'cwe-markdown': MarkdownElement;
    }
}
