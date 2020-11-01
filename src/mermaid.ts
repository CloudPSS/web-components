import { Subscription, merge } from 'rxjs';
import { tap, share, map, distinctUntilChanged } from 'rxjs/operators';
import { resizing } from './private/utils';
import mermaid from 'mermaid';
import { customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import { theme } from './config';
import mermaidAPI from 'mermaid/mermaidAPI';

let t: mermaidAPI.Theme = 'default';

const tSub = theme.pipe(
    map((v) => (v === 'dark' ? 'dark' : 'default')),
    distinctUntilChanged(),
    tap((v) => (t = v)),
    share(),
);

/**
 * mermaid 流程图组件
 */
@customElement('cwe-mermaid')
export class MermaidElement extends UpdatingElement {
    constructor() {
        super();
        this.renderRoot = this.attachShadow({ mode: 'open' });
    }
    /** 渲染元素 */
    private readonly renderRoot: ShadowRoot | this;
    /** 渲染 */
    private rerender?: Subscription;
    /** 图表配置 */
    @property({ reflect: true }) config?: string;
    /** 主题 */
    @property({ reflect: true }) theme?: mermaidAPI.Theme;

    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        this.rerender?.unsubscribe();
        this.rerender = undefined;
        this.innerHTML = '';
        const render = (): void => {
            const theme = this.theme ?? t;
            mermaid.initialize({ theme });
            mermaid.render(`mermaid_${Math.floor(Math.random() * 10000000000)}`, this.config ?? '', (svg, func) => {
                this.renderRoot.innerHTML = svg;
                func?.(this.renderRoot as Element);
            });
        };
        this.rerender = merge(resizing(this), tSub).subscribe(render);
        render();
    }
    /**
     * @inheritdoc
     */
    disconnectedCallback(): void {
        this.rerender?.unsubscribe();
        this.rerender = undefined;
        document.createElement;
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
        'cwe-mermaid': MermaidElement;
    }
}
