import { Subscription } from 'rxjs';
import { resizing } from './private/utils';
import { customElement, UpdatingElement, property, PropertyValues } from 'lit-element';
import ChartJs from 'chart.js';

/**
 * chartJs 组件
 */
@customElement('cwe-chart')
export class ChartElement extends UpdatingElement {
    constructor() {
        super();
        this.renderRoot = this.attachShadow({ mode: 'open' });
    }
    /** 渲染元素 */
    private readonly renderRoot: ShadowRoot | this;
    /** 渲染 */
    private rerender?: Subscription;
    /** 图表配置 */
    @property({ reflect: true, type: Object }) config?: ChartJs.ChartConfiguration;
    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        this.renderRoot.innerHTML = '';
        this.rerender?.unsubscribe();
        this.rerender = undefined;
        try {
            const config: ChartJs.ChartConfiguration = { ...this.config };
            config.options = { ...config.options, responsive: false };
            this.style.display = 'block';
            const canvas = document.createElement('canvas');
            this.renderRoot.appendChild(canvas);
            canvas.style.maxWidth = '800px';
            const chart = new ChartJs(canvas, config);
            const render = (): void => {
                canvas.style.width = '100%';
                canvas.style.height = '';
                chart.resize();
                canvas.style.width = '100%';
                canvas.style.height = '';
            };
            render();
            this.rerender = resizing(this).subscribe(render);
        } catch (ex) {
            const p = document.createElement('p');
            p.innerText = String(ex);
            this.renderRoot.appendChild(p);
        }
    }
    /**
     * @inheritdoc
     */
    disconnectedCallback(): void {
        this.rerender?.unsubscribe();
        this.rerender = undefined;
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
