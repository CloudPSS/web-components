import { resolve, style, theme } from './config.js';
import { CSSResultArray, PropertyValues, ReactiveElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { loadStyle } from './private/utils.js';
import Prism from 'prismjs';
import PrismComponents from 'prismjs/components.js';
import autoloader from './private/prism-autoloader.js';
import styles from './highlight.scss';

autoloader.languages_path = resolvePrism('components/');

/** 语言 */
interface Language {
    /** 名字 */
    title: string;
    /** 别名 */
    alias?: string[] | string;
    /** 映射到每个别名对应名字 */
    aliasTitles?: Record<string, string>;
    /** 依赖 */
    require?: string | string[];
}

/**
 * 解析 prismjs 中的文件
 */
function resolvePrism(file: string): string {
    return resolve('prismjs', '^1', file);
}

/**
 * 加载样式
 */
function loadPrismStyle(el: HTMLLinkElement, theme: string): Promise<void> {
    const src = resolvePrism(`themes/${theme}.css`);
    return loadStyle(el, src);
}

/**
 * 高亮组件
 */
@customElement('cwe-highlight')
export class HighlightElement extends ReactiveElement {
    constructor() {
        super();
        const renderRoot = this.createRenderRoot();
        this.elCode = document.createElement('code');
        this.elStyle = document.createElement('link');
        this.elStyle.rel = 'stylesheet';
        const pre = document.createElement('pre');
        pre.appendChild(this.elCode);
        renderRoot.appendChild(pre);
        renderRoot.appendChild(this.elStyle);

        const customStyle = style(this);
        if (customStyle) {
            const s = document.createElement('style');
            s.classList.add('custom-style');
            s.textContent = customStyle;
            renderRoot.appendChild(s);
        }
    }
    /**
     * @inheritdoc
     */
    static override get styles(): CSSResultArray {
        return [styles];
    }
    /** 代码元素 */
    private readonly elCode: HTMLElement;
    /** 样式元素 */
    private readonly elStyle: HTMLLinkElement;

    /** 语言 */
    @property({ reflect: true })
    language?: string | null;
    /** 代码段 */
    @property({ reflect: true }) srcdoc?: string;
    /** prism 样式表名字 */
    @property({ reflect: true }) prismStyle?: string;

    /** 订阅主题变更 */
    private watchTheme?: Subscription;
    /** @inheritdoc */
    override connectedCallback(): void {
        super.connectedCallback();
        this.watchTheme = theme.subscribe((t) => {
            const style = this.prismStyle;
            if (!style) {
                void loadPrismStyle(this.elStyle, t === 'dark' ? 'prism-tomorrow' : 'prism-coy');
            }
        });
    }
    /** @inheritdoc */
    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.watchTheme?.unsubscribe();
        this.watchTheme = undefined;
    }

    /**
     * Wait prism.js to initialize.
     *
     * @inheritdoc
     */
    protected override async performUpdate(): Promise<unknown> {
        const l = setTimeout(() => {
            this.elCode.textContent = this.srcdoc ?? '';
        }, 50);
        clearTimeout(l);
        return super.performUpdate();
    }

    /**
     * @inheritdoc
     */
    protected override update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        if (changedProperties.has('prismStyle')) {
            const style = this.prismStyle;
            if (style) {
                void loadPrismStyle(this.elStyle, style);
            }
        }
        if (changedProperties.has('language') || changedProperties.has('srcdoc')) {
            let lang = this.language ?? '';
            lang = lang.toLowerCase();

            let langData: Language | undefined;
            let langKey: string | undefined;
            for (const langDef in PrismComponents.languages) {
                const currentData = PrismComponents.languages[langDef] as Language;
                if (!currentData?.title) continue;
                if (lang === langDef) {
                    langKey = langDef;
                    langData = currentData;
                    break;
                }
                if (
                    currentData.alias &&
                    (Array.isArray(currentData.alias) ? currentData.alias.includes(lang) : currentData.alias === lang)
                ) {
                    langKey = langDef;
                    langData = currentData;
                    break;
                }
            }
            const langTitle = langData?.aliasTitles?.[lang] ?? langData?.title ?? this.language ?? '';
            if (langTitle) this.language = langTitle;
            const code = this.srcdoc ?? '';
            if (langKey) {
                const k = langKey;
                this.elCode.setAttribute('language', lang);
                const highlighter = Prism.languages[k];
                if (highlighter) {
                    this.elCode.innerHTML = Prism.highlight(code, Prism.languages[k], lang);
                } else {
                    this.elCode.textContent = code;

                    autoloader.loadLanguages(lang, () => {
                        this.elCode.innerHTML = Prism.highlight(code, Prism.languages[k], lang);
                    });
                }
            } else {
                this.elCode.removeAttribute('language');
                this.elCode.textContent = code;
            }
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
        'cwe-highlight': HighlightElement;
    }
}
