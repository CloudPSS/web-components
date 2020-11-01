import { customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import markdownIt from './private/markdown';
import styles from './markdown.css';

let fm: string | undefined;
let src: URL | undefined;
const md = markdownIt({
    frontMatter: (value) => {
        fm = value;
    },
});
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

/**
 * Markdown 组件
 *
 * @event render
 */
@customElement('cwe-markdown')
export class MarkdownElement extends UpdatingElement {
    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        this.elBaseStyle = document.createElement('style');
        this.elUserStyle = document.createElement('style');
        this.elArticle = document.createElement('article');
        root.append(this.elBaseStyle, this.elUserStyle, this.elArticle);

        this.elBaseStyle.textContent = styles.cssText;
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

    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);

        if (changedProperties.has('srcdoc') || changedProperties.has('src') || changedProperties.size === 0) {
            src = new URL(this.src ?? document.location.href, document.baseURI);
            const doc = this.srcdoc ?? '';
            const rendered = md.renderFragment(doc);
            src = undefined;
            const frontMatter = fm;
            fm = undefined;

            this.elArticle.innerHTML = '';
            this.elArticle.appendChild(rendered.content);
            const headers = Array.from(this.elArticle.children)
                .filter((i): i is HTMLHeadingElement => i instanceof HTMLHeadingElement)
                .map((h) => {
                    return {
                        id: h.id,
                        title: h.innerText,
                        level: Number.parseInt(h.tagName.slice(1)),
                        element: h,
                    };
                });
            this.dispatchEvent(
                new CustomEvent('render', {
                    detail: {
                        frontMatter,
                        headers,
                    },
                }),
            );
        }

        if (changedProperties.has('docStyle') || changedProperties.size === 0) {
            this.elUserStyle.textContent = this.docStyle ?? null;
        }
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
