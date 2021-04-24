/// <reference types="prismjs" />

import { resolve, style, theme } from './config';
import { customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import { Subscription } from 'rxjs';
import styles from './highlight.styles';
import { loadStyle } from './private/utils';

const languageNameReplacement: Record<string, string> = {
    js: 'javascript',
    g4: 'antlr4',
    adoc: 'asciidoc',
    shell: 'bash',
    shortcode: 'bbcode',
    cs: 'csharp',
    dotnet: 'csharp',
    coffee: 'coffeescript',
    conc: 'concurnas',
    jinja2: 'django',
    'dns-zone': 'dns-zone-file',
    dockerfile: 'docker',
    eta: 'ejs',
    xlsx: 'excel-formula',
    xls: 'excel-formula',
    gamemakerlanguage: 'gml',
    hs: 'haskell',
    kt: 'kotlin',
    kts: 'kotlin',
    tex: 'latex',
    ly: 'lilypond',
    emacs: 'lisp',
    elisp: 'lisp',
    'emacs-lisp': 'lisp',
    md: 'markdown',
    moon: 'moonscript',
    n4jsd: 'n4js',
    nani: 'naniscript',
    objc: 'objectivec',
    px: 'pcaxis',
    pcode: 'peoplecode',
    pq: 'powerquery',
    pbfasm: 'purebasic',
    purs: 'purescript',
    py: 'python',
    rkt: 'racket',
    rpy: 'renpy',
    robot: 'robotframework',
    rb: 'ruby',
    'sh-session': 'shell-session',
    shellsession: 'shell-session',
    smlnj: 'sml',
    sol: 'solidity',
    sln: 'solution-file',
    rq: 'sparql',
    t4: 't4-cs',
    trig: 'turtle',
    ts: 'typescript',
    tsconfig: 'typoscript',
    uscript: 'unrealscript',
    uc: 'unrealscript',
    vb: 'visual-basic',
    vba: 'visual-basic',
    xeoracube: 'xeora',
    yml: 'yaml',
};

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

let initPromise: Promise<void> | undefined;
/**
 * 初始化 prismjs
 */
function init(): Promise<void> {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        if ('Prism' in window && 'autoloader' in window.Prism.plugins) return;
        const script = document.createElement('script');
        script.src = resolvePrism('components/prism-core.min.js');
        script.crossOrigin = 'anonymous';
        const plugins = document.createElement('script');
        plugins.src = resolvePrism('plugins/autoloader/prism-autoloader.min.js');
        plugins.crossOrigin = 'anonymous';
        const l1 = new Promise((resolve, reject) => {
            script.addEventListener('load', resolve);
            script.addEventListener('error', reject);
        });
        document.documentElement.append(script);
        await l1;
        const l2 = new Promise((resolve, reject) => {
            plugins.addEventListener('load', resolve);
            plugins.addEventListener('error', reject);
        });
        document.documentElement.append(plugins);
        await l2;
        await new Promise((resolve) => setTimeout(resolve, 10));
        script.remove();
        plugins.remove();
        return;
    })();
    return initPromise;
}

/**
 * 高亮组件
 */
@customElement('cwe-highlight')
export class HighlightElement extends UpdatingElement {
    constructor() {
        super();
        void init();
        const renderRoot = this.attachShadow({ mode: 'open' });
        renderRoot.innerHTML = `<pre><code></code></pre><link rel="stylesheet" />
        <style></style>`;
        this.elCode = renderRoot.querySelector('code') as HTMLElement;
        this.elStyle = renderRoot.querySelector('link') as HTMLLinkElement;
        this.elBaseStyle = renderRoot.querySelector('style') as HTMLStyleElement;
        this.elBaseStyle.textContent = style(this) + '\n' + styles.cssText;
    }
    /** 代码元素 */
    private readonly elCode: HTMLElement;
    /** 样式元素 */
    private readonly elStyle: HTMLLinkElement;
    /** 样式元素 */
    private readonly elBaseStyle: HTMLStyleElement;

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
    connectedCallback(): void {
        super.connectedCallback();
        this.watchTheme = theme.subscribe((t) => {
            const style = this.prismStyle;
            if (!style) {
                void loadPrismStyle(this.elStyle, t === 'dark' ? 'prism-tomorrow' : 'prism-coy');
            }
        });
    }
    /** @inheritdoc */
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.watchTheme?.unsubscribe();
        this.watchTheme = undefined;
    }

    /**
     * Wait prism.js to initialize.
     *
     * @inheritdoc
     */
    async performUpdate(): Promise<unknown> {
        const l = setTimeout(() => {
            this.elCode.textContent = this.srcdoc ?? '';
        }, 50);
        await init();
        clearTimeout(l);
        return super.performUpdate();
    }

    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
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
            if (lang in languageNameReplacement) {
                lang = languageNameReplacement[lang];
            }
            if (lang) this.language = lang;
            const code = this.srcdoc ?? '';
            if (lang) {
                this.elCode.setAttribute('language', lang);
                const Prism = window.Prism;
                const highlighter = Prism.languages[lang];
                if (highlighter) {
                    this.elCode.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
                } else {
                    this.elCode.textContent = code;
                    const autoloader = Prism.plugins['autoloader'] as {
                        loadLanguages: (name: string, callback: () => void) => void;
                    };
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
