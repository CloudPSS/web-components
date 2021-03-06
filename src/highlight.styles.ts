import { css } from 'lit-element';
import { codeFont } from './fonts';

export default css`
    :host {
        display: block;
        position: relative;
        font-size: 1em;
        line-height: 1.5;
        margin: 1.2em 0;
        border-radius: 4px;
        contain: content;
        font-family: var(--cwe-highlight-font-family, ${codeFont});
    }
    pre {
        margin: 0;
        white-space: pre;
        overflow: auto;
        padding: 1em 0.5em;

        --p-cwe-highlight-hint-color: var(--cwe-highlight-hint-color, #888);
        --p-cwe-highlight-hint-font-family: var(--cwe-highlight-hint-font-family, system-ui, sans-serif);
    }
    @media print {
        pre {
            white-space: pre-wrap;
        }
    }
    pre,
    code {
        font-family: inherit;
    }
    :host([aria-label]) pre,
    :host([language]) pre {
        padding-top: 2em;
    }
    :host::before,
    :host::after {
        font-size: 0.8em;
        font-family: var(--p-cwe-highlight-hint-font-family);
        color: var(--p-cwe-highlight-hint-color);
        position: absolute;
        z-index: -1;
        margin: 0.5em;
        display: block;
        top: 0;
    }
    :host([aria-label])::before {
        content: attr(aria-label);
        left: 0;
    }
    :host([language])::after {
        content: attr(language);
        text-transform: uppercase;
        right: 0;
    }
`;
