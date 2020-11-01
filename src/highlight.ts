/// <reference types="prismjs" />

import { resolve, theme } from './config';
import { customElement, property, PropertyValues, UpdatingElement } from 'lit-element';
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
        this.renderRoot = this.attachShadow({ mode: 'open' });
        this.renderRoot.innerHTML = `<pre><code></code></pre><link rel="stylesheet" />
        <style>:host{display: block;}</style>`;
        this.elCode = this.renderRoot.querySelector('code') as HTMLElement;
        this.elStyle = this.renderRoot.querySelector('link') as HTMLLinkElement;
    }
    /** 渲染元素 */
    private readonly renderRoot: ShadowRoot;
    /** 代码元素 */
    private readonly elCode: HTMLElement;
    /** 样式元素 */
    private readonly elStyle: HTMLLinkElement;

    /** 语言 */
    @property({
        reflect: true,
        converter: (value) => {
            if (!value) value = null;
            else {
                value = value.toLowerCase();
                if (value in languageNameReplacement) {
                    value = languageNameReplacement[value];
                }
            }
            return value;
        },
    })
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
        await init();
        return super.performUpdate();
    }

    /**
     * @inheritdoc
     */
    update(changedProperties: PropertyValues): void {
        super.update(changedProperties);
        const lang = this.language;
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
