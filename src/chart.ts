import {
    customElement,
    property,
    PropertyValues,
    LitElement,
    query,
    CSSResultArray,
    TemplateResult,
    html,
} from 'lit-element';
import { nothing } from 'lit-html';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { style } from './config';
import styles from './chart.scss.style.js';

Chart.register(...registerables);

/**
 * chartJs 组件
 */
@customElement('cwe-chart')
export class ChartElement extends LitElement {
    /**
     * @inheritdoc
     */
    static get styles(): CSSResultArray {
        return [styles];
    }
    constructor() {
        super();
    }
    /** 渲染元素 */
    @query('canvas') private readonly elCanvas!: HTMLCanvasElement;
    /** 渲染元素 */
    @query('#error') private readonly elError!: HTMLParagraphElement;
    /** 图表配置 */
    @property({ reflect: true, type: Object }) config?: ChartConfiguration;
    /** 表格 */
    private __chart?: Chart;
    /**
     * @inheritdoc
     */
    render(): TemplateResult {
        const customStyle = style(this);
        return html`<div id="container">
                <canvas></canvas>
                <p id="error"></p>
            </div>
            ${customStyle
                ? html`<style>
                      ${customStyle}
                  </style>`
                : nothing}`;
    }

    /**
     * 创建图表
     */
    private createChart(): void {
        const canvas = this.elCanvas;
        if (!canvas) return;
        try {
            this.elError.textContent = null;
            const config = { ...this.config } as ChartConfiguration;
            config.options = { ...config.options };
            this.__chart?.destroy();
            this.__chart = new Chart(canvas, config);
        } catch (ex) {
            this.elError.textContent = String(ex);
        }
    }

    /**
     * @inheritdoc
     */
    updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        this.createChart();
    }

    /**
     * @inheritdoc
     */
    connectedCallback(): void {
        super.connectedCallback();
        this.createChart();
    }

    /**
     * @inheritdoc
     */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.__chart?.destroy();
        delete this.__chart;
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
