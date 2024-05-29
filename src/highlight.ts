import { resolve, style, theme } from './config.js';
import { CSSResultArray, PropertyValues, ReactiveElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { loadStyle } from './private/utils.js';
import Prism from 'prismjs';
import PrismComponents from 'prismjs/components.js';
import autoloader from './private/prism-autoloader.js';
import styles from './highlight.scss?lit&inline';

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

const langMap = new Map<string, string>();
const langTitleMap = new Map<string, string>();
for (const [key, def] of Object.entries(PrismComponents.languages as Record<string, Language>)) {
    const title = def.title ?? key;
    langMap.set(key, key);
    langMap.set(title.toLowerCase(), key);
    langTitleMap.set(key, title);

    const aliases = Array.isArray(def.alias) ? def.alias : def.alias ? [def.alias] : [];
    const aliasTitles = def.aliasTitles ?? {};
    for (const alias of aliases) {
        const aliasTitle = aliasTitles[alias] ?? title;
        langMap.set(alias.toLowerCase(), key);
        langMap.set(aliasTitle.toLowerCase(), key);
        langTitleMap.set(alias.toLowerCase(), aliasTitle);
    }
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
        const pre = document.createElement('pre');
        pre.append(this.elCode);
        renderRoot.append(pre);

        this.elStyle = document.createElement('link');
        this.elStyle.rel = 'stylesheet';
        this.elStyle.media = 'screen';
        renderRoot.append(this.elStyle);

        const elPrintStyle = document.createElement('link');
        elPrintStyle.rel = 'stylesheet';
        elPrintStyle.media = 'print';
        void loadPrismStyle(elPrintStyle, 'prism-coy');
        renderRoot.append(elPrintStyle);

        const customStyle = style(this);
        if (customStyle) {
            const s = document.createElement('style');
            s.classList.add('custom-style');
            s.textContent = customStyle;
            renderRoot.append(s);
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

    static readonly languages = PrismComponents.languages as Record<string, Language>;
    /** 语言 */
    private _language?: string;
    /** 语言 */
    @property({ noAccessor: true })
    get language(): string | undefined {
        return this._language;
    }
    set language(value: string | undefined) {
        const oldValue = this._language;
        if (typeof value == 'string') {
            value = value.toLowerCase();
            value = langTitleMap.get(value) ?? value;
        } else {
            value = undefined;
        }
        if (oldValue === value) return;
        this._language = value;
        this.requestUpdate('language', oldValue);
        if (value) this.setAttribute('language', value);
        else this.removeAttribute('language');
    }
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
            const code = this.srcdoc ?? '';
            const lang = this.language && langMap.get(this.language.toLowerCase());
            if (lang) {
                this.elCode.setAttribute('language', lang);
                const highlighter = Prism.languages[lang];
                if (highlighter) {
                    this.elCode.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
                } else {
                    this.elCode.textContent = code;

                    autoloader.loadLanguages(lang, () => {
                        this.elCode.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
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
