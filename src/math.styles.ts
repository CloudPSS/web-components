import { css } from 'lit-element';

export default css`
    :host {
        display: inline;
        user-select: all;
        --p-cwe-math-error-color: var(--cwe-math-error-color, red);
    }
    :host([mode='display']) {
        display: block;
        overflow: auto;
        margin: 0.8em 0;
    }
    .cwe-styles {
        display: none;
    }
    .cwe-content {
        display: contents;
    }
    .error {
        color: var(--p-cwe-math-error-color);
    }
`;
