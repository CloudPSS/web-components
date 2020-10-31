/// <reference types="prismjs" />

import { _resolver } from 'config';
import { customElement, property, PropertyValues, UpdatingElement } from 'lit-element';

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

let initPromise: Promise<void> | undefined;
function init(): Promise<void> {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        if ('Prism' in window && 'autoloader' in window.Prism.plugins) return;
        const script = document.createElement('script');
        script.src = _resolver('prismjs', '^1', 'components/prism-core.min.js');
        const plugins = document.createElement('script');
        plugins.src = _resolver('prismjs', '^1', 'plugins/autoloader/prism-autoloader.min.js');
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
    }

    @property({ reflect: true }) language?: string | null;
    @property({ reflect: true }) srcdoc?: string;

    /**
     * Wait prism.js to initialize.
     *
     * @inheritdoc
     */
    async performUpdate(): Promise<unknown> {
        await init();
        return super.performUpdate();
    }

    async update(changedProperties: PropertyValues): Promise<void> {
        super.update(changedProperties);
        let lang = this.language;
        if (!lang) lang = null;
        else {
            lang = lang.toLowerCase();
            if (lang in languageNameReplacement) {
                lang = languageNameReplacement[lang];
            }
        }
        this.language = lang;
        const code = this.srcdoc ?? '';
        if (lang) {
            const l = lang;
            const Prism = window.Prism;
            const highlighter = Prism.languages[l];
            if (highlighter) {
                this.innerHTML = Prism.highlight(code, Prism.languages[l], l);
            } else {
                const autoloader = Prism.plugins.autoloader as {
                    loadLanguages: (name: string, callback: () => void) => void;
                };
                autoloader.loadLanguages(l, () => {
                    this.innerHTML = Prism.highlight(code, Prism.languages[l], l);
                });
            }
        } else {
            this.textContent = code;
        }
    }
}
