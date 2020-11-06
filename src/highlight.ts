/// <reference types="prismjs" />

import { resolve, theme } from './config';
import { css, customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
import { Subscription } from 'rxjs';

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
        const plugins = document.createElement('script');
        plugins.src = resolvePrism('plugins/autoloader/prism-autoloader.min.js');
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
        await new Promise((resolve) => setTimeout(resolve, 1));
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
        this.elBaseStyle.textContent = css`
            :host {
                display: block;
                position: relative;
                font-family: Menlo, Consolas, Roboto Mono, 'Ubuntu Monospace', Noto Mono, Oxygen Mono, Liberation Mono,
                    monospace, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
                font-size: 1.05em;
                line-height: 1.5;
                margin: 1.2em 0;
                border-radius: 4px;
                contain: content;
                --cwe-hint-color: #888;
            }
            pre {
                margin: 0;
                overflow: auto;
                padding: 2em 0.5em 1em;
            }
            :host::before,
            :host::after {
                font-size: 0.8em;
                position: absolute;
                margin: 0.5em;
                display: block;
                top: 0;
                color: var(--cwe-hint-color);
            }
            :host([aria-label])::before {
                content: attr(aria-label);
                left: 0;
            }
            :host([language])::after {
                content: attr(language);
                text-transform: uppercase;
                right: 0;
                top: 0;
            }
        `.cssText;
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
                this.elStyle.href = resolvePrism(`themes/${t === 'dark' ? 'prism-tomorrow' : 'prism-coy'}.css`);
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
        this.elCode.textContent = this.srcdoc ?? '';
        await init();
        return super.performUpdate();
    }

    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        let lang = this.language ?? '';
        lang = lang.toLowerCase();
        if (lang in languageNameReplacement) {
            lang = languageNameReplacement[lang];
        }
        if (lang) this.language = lang;
        const code = this.srcdoc ?? '';
        const style = this.prismStyle;
        if (style) {
            this.elStyle.href = resolvePrism(`themes/${style}.css`);
        }
        if (lang) {
            this.elCode.setAttribute('language', lang);
            const Prism = window.Prism;
            const highlighter = Prism.languages[lang];
            if (highlighter) {
                this.elCode.innerHTML = Prism.highlight(code, Prism.languages[lang], lang);
            } else {
                this.elCode.textContent = code;
                const autoloader = Prism.plugins.autoloader as {
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
