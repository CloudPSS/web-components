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
        this.renderRoot = this.attachShadow({ mode: 'open' });
    }
    /** 渲染元素 */
    private readonly renderRoot: ShadowRoot;
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
        this.renderRoot.innerHTML = '';

        src = new URL(this.src ?? document.location.href, document.baseURI);
        const doc = this.srcdoc ?? '';
        const rendered = md.renderFragment(doc);
        src = undefined;
        const frontMatter = fm;
        fm = undefined;
        this.renderRoot.appendChild(rendered.content);

        const style = styles + (this.docStyle ?? '');
        const elStyle = document.createElement('style');
        elStyle.innerText = style;
        this.renderRoot.appendChild(elStyle);

        const headers = Array.from(this.renderRoot.children)
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
