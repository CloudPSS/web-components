import { Subscription, merge, Observable, fromEvent } from 'rxjs';
import { tap, share, map, distinctUntilChanged, delay, throttleTime, mapTo } from 'rxjs/operators';
import mermaid from 'mermaid';
import type mermaidAPI from 'mermaid/mermaidAPI';
import {
    css,
    CSSResultArray,
    customElement,
    html,
    LitElement,
    property,
    PropertyValues,
    query,
    TemplateResult,
} from 'lit-element';
import { nothing } from 'lit-html';
import { style, theme } from './config';

let t: mermaidAPI.Theme = 'default';

const tSub = theme.pipe(
    map((v) => (v === 'dark' ? 'dark' : 'default')),
    distinctUntilChanged(),
    tap((v) => (t = v)),
    share(),
);
/**
 * 元素大小变化
 */
const resizeStart: Observable<void> = fromEvent(window, 'resize').pipe(throttleTime(100), mapTo(undefined), share());
const resizeAction = resizeStart.pipe(delay(200));
const resizeEnd = resizeStart.pipe(delay(300));

/**
 * mermaid 流程图组件
 */
@customElement('cwe-mermaid')
export class MermaidElement extends LitElement {
    /**
     * @inheritdoc
     */
    static get styles(): CSSResultArray {
        return [
            css`
                :host {
                    display: block;
                    margin: 1em 0;
                    overflow: auto;
                }
                :host(.resizing) {
                    overflow: hidden;
                }
                svg {
                    width: auto;
                    height: auto;
                    display: block;
                    margin: auto;
                }
            `,
        ];
    }
    constructor() {
        super();
    }
    /** 渲染 */
    private readonly subs: Array<Subscription | undefined> = [undefined];
    /** 图表配置 */
    @property({ reflect: true }) config?: string;
    /** 主题 */
    @property({ reflect: true }) theme?: mermaidAPI.Theme;

    /** 容器 */
    @query('#container') elContainer!: HTMLDivElement;
    /**
     * @inheritdoc
     */
    connectedCallback(): void {
        super.connectedCallback();
        this.subs[0] = undefined;
        this.subs.push(
            resizeStart.subscribe(() => this.classList.add('resizing')),
            resizeEnd.subscribe(() => this.classList.remove('resizing')),
        );
    }
    /**
     * @inheritdoc
     */
    render(): TemplateResult {
        const customStyle = style(this);
        return html`<div id="container"></div>
            ${customStyle
                ? html`<style>
                      ${customStyle}
                  </style>`
                : nothing}`;
    }

    /**
     * @inheritdoc
     */
    updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        this.subs[0]?.unsubscribe();
        const render = (): void => {
            const theme = this.theme ?? t;
            mermaid.initialize({ theme });
            mermaid.render(`mermaid_${Math.floor(Math.random() * 10000000000)}`, this.config ?? '', (svg, func) => {
                this.elContainer.innerHTML = svg;
                func?.(this.renderRoot as Element);
            });
        };
        this.subs[0] = merge(resizeAction, tSub).subscribe(render);
        render();
    }
    /**
     * @inheritdoc
     */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.subs.splice(0).forEach((s) => s?.unsubscribe());
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
