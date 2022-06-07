import { Subscription, merge, Observable, fromEvent } from 'rxjs';
import { tap, share, map, distinctUntilChanged, delay, throttleTime, mapTo } from 'rxjs/operators';
import mermaid from 'mermaid';
import type mermaidAPI from 'mermaid/mermaidAPI';
import {
    CSSResultArray,
    customElement,
    html,
    LitElement,
    property,
    PropertyValues,
    query,
    TemplateResult,
} from 'lit-element';
import { style, theme } from './config';
import styles from './mermaid.scss.style.js';

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
const resizeStart: Observable<void> = fromEvent(window, 'resize').pipe(mapTo(undefined), share());
const resizeAction = resizeStart.pipe(throttleTime(300, undefined, { leading: true, trailing: true }));
const resizeEnd = resizeAction.pipe(delay(200));

/** 插入样式 */
function insertRootStyle(): void {
    if (document.getElementById('mermaid-root-style') != null) return;

    const rootStyle = document.createElement('style');
    rootStyle.id = 'mermaid-root-style';
    rootStyle.textContent = `
div.mermaidTooltip {
  position: absolute;
  text-align: center;
  max-width: 200px;
  padding: 2px;
  font-family: "trebuchet ms", verdana, arial, sans-serif;
  font-size: 12px;
  background: hsl(80, 100%, 96.2745098039%);
  border: 1px solid #aaaa33;
  border-radius: 2px;
  pointer-events: none;
  z-index: 100;
}
:root {
  --mermaid-font-family: "trebuchet ms", verdana, arial, sans-serif;
}
`;
    if (!document.head) {
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(rootStyle);
        });
    } else {
        document.head.appendChild(rootStyle);
    }
}

/**
 * mermaid 流程图组件
 */
@customElement('cwe-mermaid')
export class MermaidElement extends LitElement {
    /**
     * @inheritdoc
     */
    static override get styles(): CSSResultArray {
        return [styles];
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
    @query('.container', true) elContainer!: HTMLDivElement;
    /**
     * @inheritdoc
     */
    override connectedCallback(): void {
        super.connectedCallback();
        insertRootStyle();
        this.subs[0] = undefined;
        this.subs.push(
            resizeStart.subscribe(() => this.setAttribute('resizing', '')),
            resizeEnd.subscribe(() => this.removeAttribute('resizing')),
        );
    }
    /**
     * @inheritdoc
     */
    protected override render(): TemplateResult {
        const customStyle = style(this);
        return html`<div class="container"></div>
            ${customStyle ? html`<style class="custom-style" .textContent=${customStyle}></style>` : undefined}`;
    }

    /**
     * @inheritdoc
     */
    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        this.subs[0]?.unsubscribe();
        const render = (): void => {
            const config = this.config ?? '';
            const theme = this.theme ?? t;
            mermaid.initialize({ theme });
            try {
                this.elContainer.classList.remove('error');
                mermaid.parse(config);
            } catch (ex) {
                const e = ex as Error & { str: string };
                this.elContainer.textContent = e.str || e.message || String(e);
                this.elContainer.classList.add('error');
                return;
            }
            const container = document.createElement('div');
            container.style.width = `${this.clientWidth}px`;
            container.id = `mermaid_temp_${Math.floor(Math.random() * 10000000000)}`;
            document.body.append(container);
            mermaid.render(
                `mermaid_${Math.floor(Math.random() * 10000000000)}`,
                this.config ?? '',
                (svg, func) => {
                    const el = this.elContainer;
                    el.innerHTML = svg;
                    func?.(el);
                },
                container,
            );
            container.remove();
        };
        this.subs[0] = merge(resizeAction, tSub).subscribe(() => requestAnimationFrame(render));
        render();
    }
    /**
     * @inheritdoc
     */
    override disconnectedCallback(): void {
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
