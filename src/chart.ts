import {
    customElement,
    property,
    PropertyValues,
    LitElement,
    query,
    CSSResultArray,
    css,
    TemplateResult,
    html,
} from 'lit-element';
import { nothing } from 'lit-html';
import ChartJs from 'chart.js';
import { style } from './config';

/**
 * chartJs 组件
 */
@customElement('cwe-chart')
export class ChartElement extends LitElement {
    /**
     * @inheritdoc
     */
    static get styles(): CSSResultArray {
        return [
            css`
                :host {
                    display: block;
                    margin: 1em 0;
                }
                canvas {
                    max-width: 800px;
                    width: 100%;
                    height: auto;
                    margin: auto;
                }
            `,
        ];
    }
    constructor() {
        super();
    }
    /** 渲染元素 */
    @query('canvas') private readonly elCanvas!: HTMLCanvasElement;
    /** 图表配置 */
    @property({ reflect: true, type: Object }) config?: ChartJs.ChartConfiguration;
    /**
     * @inheritdoc
     */
    render(): TemplateResult {
        const customStyle = style(this);
        return html`<div id="container">
                <canvas></canvas>
            </div>
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
        const canvas = this.elCanvas;
        try {
            const config: ChartJs.ChartConfiguration = { ...this.config };
            config.options = { ...config.options };
            this.renderRoot.appendChild(canvas);
            new ChartJs(canvas, config);
        } catch (ex) {
            const p = document.createElement('p');
            p.innerText = String(ex);
            this.renderRoot.appendChild(p);
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
        'cwe-chart': ChartElement;
    }
}
