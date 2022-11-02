import katex from 'katex/dist/katex.mjs';
import { escapeHtml } from 'markdown-it/lib/common/utils.js';
import { PropertyValues, UpdatingElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { resolve, style as cfgStyle } from './config.js';
import { loadStyle } from './private/utils.js';
import styles from './math.scss';

const katexVersion: string = katex.version || '^0.12';
const katexCss = resolve('katex', katexVersion, 'dist/katex.css');

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

void loadStyle(undefined, katexCss, false);

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
        this.elStyles.classList.add('cwe-styles');
        this.elContent = document.createElement('div');
        this.elContent.classList.add('cwe-content');
        root.append(this.elStyles, this.elContent);
        const link = document.createElement('link');
        this.elStyles.appendChild(link);
        void loadStyle(link, katexCss);
        const elStyle = document.createElement('style');
        elStyle.textContent = cfgStyle(this) + '\n' + styles.cssText;
        this.elStyles.appendChild(elStyle);
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
    protected override async update(changedProperties: PropertyValues): Promise<void> {
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
