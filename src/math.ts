import * as katex from 'katex';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import { css, customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import { resolve } from './config';

/** asciimathToLatex */
// let asciimathToLatex: (asciimath: string) => string;

/** 公式显示模式 */
type DisplayMode = 'inline' | 'display';

/**
 * 一种公式语言
 */
type Language = {
    copyDelimiters: Record<MathMode, [string, string]>;
    /**
     * 渲染公式
     */
    render(this: MathElement, source: string, mode: MathMode): void | Promise<void>;
};

/**
 * 注入样式
 */
function style(el: HTMLElement): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = resolve('katex', '^0.12', 'dist/katex.css');
    const style = document.createElement('style');
    style.textContent = css`
        cwe-math {
            display: inline;
            user-select: all;
        }
        cwe-math[mode='display'] {
            display: inline-block;
            overflow: auto;
            margin: 0.8em 0;
        }
    `.cssText;
    el.appendChild(link);
    el.appendChild(style);
}

const languages: Record<string, Language | { aliasOf: string }> = {
    tex: {
        copyDelimiters: {
            inline: ['$', '$'],
            display: ['$$ ', ' $$'],
        },
        render(source: string, mode: 'display' | 'inline'): void {
            katex.render(source, this, {
                displayMode: mode === 'display',
            });
            style(this);
        },
    },
    latex: { aliasOf: 'tex' },
    katex: { aliasOf: 'tex' },
    // asciimath: {
    //     copyDelimiters: {
    //         inline: ['\\(', '\\)'],
    //         display: ['\\[ ', ' \\]'],
    //     },
    //     render(source: string, mode: 'display' | 'inline'): void | Promise<void> {
    //         const tex = asciimathToLatex(source);
    //         return (languages.tex as Language).render.call(this, tex, mode);
    //     },
    // },
};

/**
 * 将 cwe-math 中的内容替换为源
 */
function replaceMathText(fragment: DocumentFragment): void {
    const math = fragment.querySelectorAll<MathElement>(`cwe-math[language]`);
    math.forEach((el) => {
        const source = el.dataset.source ?? '';
        if (!source) return;
        const lang = el.language;
        const mode = el.mode;
        if (!lang || !(lang in languages)) {
            return;
        }
        const d = (languages[lang] as Language).copyDelimiters[mode];
        el.textContent = `${d[0]}${source}${d[1]}`;
    });
}

/**复制 */
function onCopy(event: HTMLElementEventMap['copy']): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !event.clipboardData) {
        return;
    }
    const fragment = selection.getRangeAt(0).cloneContents();
    if (!fragment.querySelector('cwe-math')) {
        return;
    }
    // Preserve usual HTML copy/paste behavior.
    const html: string[] = [];
    fragment.childNodes.forEach((node) => {
        html.push((node as Element).outerHTML);
    });
    event.clipboardData.setData('text/html', html.join(''));
    replaceMathText(fragment);
    // Rewrite plain-text version.
    event.clipboardData.setData('text/plain', fragment.textContent ?? '');
    // Prevent normal copy handling.
    event.preventDefault();
}

document.addEventListener('copy', onCopy);
style(document.head);

/**
 * 公式模式
 */
type MathMode = 'inline' | 'display';

/**
 * 公式组件
 */
@customElement('cwe-math')
export class MathElement extends UpdatingElement {
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
            this.innerHTML = `<span class="error">Unsupported language ${lang ?? ''}</span>`;
            return;
        }
        try {
            await langDef.render.call(this, source, this.mode);
        } catch (ex) {
            this.innerHTML = `<span class="error" title="${escapeHtml(String(ex))}">${escapeHtml(source)}</span>`;
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
