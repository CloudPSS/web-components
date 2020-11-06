import katex from 'katex';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import { css, customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import { resolve, style as cfgStyle } from './config';

/** asciimathToLatex */
// let asciimathToLatex: (asciimath: string) => string;

/** 公式显示模式 */
type DisplayMode = 'inline' | 'display';

/**
 * 一种公式语言
 */
type Language = {
    /**
     * 渲染公式
     */
    render(this: HTMLElement, source: string, mode: MathMode): void | Promise<void>;
};

/**
 * 注入样式
 */
function style(el: HTMLElement, inElement: boolean): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = resolve('katex', '^0.12', 'dist/katex.css');
    el.appendChild(link);
    if (inElement) {
        const elStyle = document.createElement('style');
        elStyle.textContent =
            cfgStyle(el) +
            '\n' +
            css`
                :host {
                    display: inline;
                    user-select: all;
                    --cwe-math-error-color: red;
                }
                :host([mode='display']) {
                    display: block;
                    overflow: auto;
                    margin: 0.8em 0;
                }
                #styles {
                    display: none;
                }
                #content {
                    display: contents;
                }
                .error {
                    color: var(--cwe-math-error-color);
                }
            `.cssText;
        el.appendChild(elStyle);
    }
}

const languages: Record<string, Language | { aliasOf: string }> = {
    tex: {
        render(source: string, mode: 'display' | 'inline'): void {
            katex.render(source, this, {
                displayMode: mode === 'display',
            });
        },
    },
    latex: { aliasOf: 'tex' },
    katex: { aliasOf: 'tex' },
    // asciimath: {
    //     render(source: string, mode: 'display' | 'inline'): void | Promise<void> {
    //         const tex = asciimathToLatex(source);
    //         return (languages.tex as Language).render.call(this, tex, mode);
    //     },
    // },
};

style(document.head, false);

/**
 * 公式模式
 */
type MathMode = 'inline' | 'display';

/**
 * 公式组件
 */
@customElement('cwe-math')
export class MathElement extends UpdatingElement {
    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        this.elStyles = document.createElement('div');
        this.elStyles.id = 'styles';
        this.elContent = document.createElement('div');
        this.elContent.id = 'content';
        root.append(this.elStyles, this.elContent);
        style(this.elStyles, true);
    }

    /** 样式 */
    private readonly elStyles: HTMLElement;
    /** 渲染结果 */
    private readonly elContent: HTMLElementTagNameMap['article'];
    /** 语言 */
    @property({
        reflect: true,
        converter: (value) => {
            let lang = value?.toLowerCase() ?? null;
            while (lang) {
                if (!(lang in languages)) {
                    lang = null;
                    break;
                }
                const langDefTemp = languages[lang];
                if ('aliasOf' in langDefTemp) {
                    lang = langDefTemp.aliasOf;
                } else {
                    break;
                }
            }
            return lang;
        },
    })
    language: string | null = 'tex';

    /** 显示模式 */
    @property({
        reflect: true,
        converter: (value) => (value === 'display' ? 'display' : 'inline'),
    })
    mode: DisplayMode = 'inline';

    /** 文档 */
    @property({ reflect: true }) srcdoc?: string;
    /**
     * @inheritdoc
     */
    async update(changedProperties: PropertyValues): Promise<void> {
        super.update(changedProperties);
        const lang = this.language;
        const langDef = lang ? (languages[lang] as Language) : undefined;

        const source = this.srcdoc?.trim() ?? '';

        if (!langDef || langDef.render == null) {
            this.elContent.innerHTML = `<span class="error">Unsupported language ${lang ?? ''}</span>`;
            return;
        }
        try {
            await langDef.render.call(this.elContent, source, this.mode);
        } catch (ex) {
            this.elContent.innerHTML = `<span class="error" title="${escapeHtml(String(ex))}">${escapeHtml(
                source,
            )}</span>`;
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
        'cwe-math': MathElement;
    }
}
