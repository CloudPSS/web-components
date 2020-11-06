import { css } from 'lit-element';
import { codeFont } from './fonts';

export default css`
    :host {
        display: block;
        position: relative;
        font-family: ${codeFont};
        font-size: 1em;
        line-height: 1.5;
        margin: 1.2em 0;
        border-radius: 4px;
        contain: content;
        --p-cwe-highlight-hint-color: var(--cwe-highlight-hint-color, #888);
    }
    pre {
        margin: 0;
        overflow: auto;
        padding: 2em 0.5em 1em;
    }
    pre,
    code {
        font-family: inherit;
    }
    :host::before,
    :host::after {
        font-size: 0.8em;
        position: absolute;
        margin: 0.5em;
        display: block;
        top: 0;
        color: var(--p-cwe-highlight-hint-color);
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
`;
