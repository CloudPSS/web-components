import { css } from 'lit-element';
import { codeFont } from './fonts';

export default css`
    :host {
        --p-cwe-markdown-link-color: var(--cwe-markdown-link-color, #3a479b);
        --p-cwe-markdown-link-hover-color: var(--cwe-markdown-link-hover-color, #606794);
        --p-cwe-markdown-link-active-color: var(--cwe-markdown-link-active-color, #37438d);
        --p-cwe-markdown-header-color: var(--cwe-markdown-header-color, #1b215f);
        --p-cwe-markdown-pre-border-color: var(--cwe-markdown-pre-border-color, #c8c8c8);
        --p-cwe-markdown-pre-background-color: var(--cwe-markdown-pre-background-color, #f2f2f2);
        --p-cwe-markdown-code-color: var(--cwe-markdown-code-color, #f50057);
        --p-cwe-markdown-code-border-color: var(--cwe-markdown-code-border-color, #c8c8c8);
        --p-cwe-markdown-code-background-color: var(--cwe-markdown-code-background-color, #f2f2f2);
        --p-cwe-markdown-blockquote-theme-color: var(--cwe-markdown-blockquote-theme-color, #5587c0);
        --p-cwe-markdown-mark-background-color: var(--cwe-markdown-mark-background-color, rgba(255, 214, 0, 0.4));
        --p-cwe-markdown-table-header-background-color: var(--cwe-markdown-table-header-background-color, #eee);
        --p-cwe-markdown-table-border-color: var(--cwe-markdown-table-border-color, #c8c8c8);
        --p-cwe-markdown-divider-color: var(--cwe-markdown-divider-color, #888888);
        line-height: 1.6;
    }
    img {
        max-width: 100%;
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        position: relative;
        color: var(--p-cwe-markdown-header-color);
        font-weight: 600;
    }
    @media screen {
        a.header-anchor {
            position: absolute;
            left: 0;
            padding: 0 0.25em;
            color: var(--p-cwe-markdown-header-color) !important;
            transform: translateX(-100%);
            opacity: 0;
            transition: all 0.2s;
        }
        a.header-anchor::before {
            content: '¶';
        }
        a.header-anchor:focus {
            opacity: 1;
        }
        h1:focus-within a.header-anchor,
        h1:focus a.header-anchor,
        h1:hover a.header-anchor,
        h2:focus-within a.header-anchor,
        h2:focus a.header-anchor,
        h2:hover a.header-anchor,
        h3:focus-within a.header-anchor,
        h3:focus a.header-anchor,
        h3:hover a.header-anchor,
        h4:focus-within a.header-anchor,
        h4:focus a.header-anchor,
        h4:hover a.header-anchor,
        h5:focus-within a.header-anchor,
        h5:focus a.header-anchor,
        h5:hover a.header-anchor,
        h6:focus-within a.header-anchor,
        h6:focus a.header-anchor,
        h6:hover a.header-anchor {
            opacity: 1;
        }
        a {
            text-decoration: none;
            color: var(--p-cwe-markdown-link-color);
        }
        a:hover {
            color: var(--p-cwe-markdown-link-hover-color);
        }
        a:active {
            color: var(--p-cwe-markdown-link-active-color);
        }
    }
    p,
    dd,
    dt,
    summary {
        word-spacing: 0.05em;
        margin: 0.8em 0;
    }
    code:not([is]) {
        display: inline-block;
        padding: 0 0.1em;
        margin: 0 0.1em;
        border: 0.05em solid;
        border-radius: 0.1em;
        vertical-align: text-bottom;
        color: var(--p-cwe-markdown-code-color);
        font-size: 0.9em;
        border-color: var(--p-cwe-markdown-code-border-color);
        background-color: var(--p-cwe-markdown-code-background-color);
    }
    [is='md-container'][class~='tip'] {
        background-color: rgba(140, 158, 255, 0.05);
        border: 0.02px solid rgba(83, 109, 254, 0.2);
        border-left: 4px solid #5c6bc0;
    }
    @media print {
        dl,
        blockquote,
        details,
        [is='md-container'],
        code {
            background-color: #ffffff !important;
            color: #000000 !important;
        }

        a {
            text-decoration: underline;
        }
        [is='md-container']:before {
            display: none;
        }
        .block-embed:before {
            display: none !important;
        }
        cwe-highlight {
            border: 0.05em solid var(--p-cwe-markdown-code-background-color);
        }
        audio,
        canvas,
        iframe,
        img,
        video {
            display: none !important;
        }
        .block-embed-hint {
            display: block !important ;
        }
    }
    [is='md-container'][class~='info'] {
        background-color: rgba(130, 177, 255, 0.05);
        border: 0.02px solid rgba(68, 138, 255, 0.2);
        border-left: 4px solid #42a5f5;
    }
    [is='md-container'][class~='question'] {
        background-color: rgba(255, 229, 127, 0.05);
        border: 0.02px solid rgba(255, 215, 64, 0.2);
        border-left: 4px solid #ffca28;
    }
    [is='md-container'][class~='success'] {
        background-color: rgba(204, 255, 144, 0.05);
        border: 0.02px solid rgba(178, 255, 89, 0.2);
        border-left: 4px solid #9ccc65;
    }
    [is='md-container'][class~='fail'] {
        background-color: rgba(255, 138, 128, 0.05);
        border: 0.02px solid rgba(255, 82, 82, 0.2);
        border-left: 4px solid #ef5350;
    }
    [is='md-container'][class~='warning'] {
        background-color: rgba(255, 209, 128, 0.05);
        border: 0.02px solid rgba(255, 171, 64, 0.2);
        border-left: 4px solid #ffa726;
    }
    [is='md-container'][class~='error'] {
        background-color: rgba(255, 138, 128, 0.05);
        border: 0.02px solid rgba(255, 82, 82, 0.2);
        border-left: 4px solid #ef5350;
    }
    [is='md-container'][class~='info']:before {
        content: 'i';
        background-color: #42a5f5;
        color: #fff;
    }
    [is='md-container'][class~='error']:before {
        content: '☓';
        background-color: #ef5350;
        color: #fff;
    }
    [is='md-container'][class~='fail']:before {
        content: '✗';
        background-color: #ef5350;
        color: #fff;
    }
    [is='md-container'][class~='warning']:before {
        content: '!';
        background-color: #ffa726;
        color: #fff;
    }
    [is='md-container'][class~='success']:before {
        content: '✓';
        background-color: #9ccc65;
        color: #fff;
    }
    [is='md-container'][class~='question']:before {
        content: '?';
        background-color: #ffca28;
        color: #fff;
    }
    [is='md-container'][class~='tip']:before {
        content: '!';
        background-color: #5c6bc0;
        color: #fff;
    }
    [is='md-container']:before {
        user-select: none;
        position: absolute;
        -webkit-transform: translate(calc(-50% - 2px), 8px);
        transform: translate(calc(-50% - 2px), 8px);
        top: 0;
        left: 0;
        width: 1.2em;
        height: 1.2em;
        border-radius: 100%;
        text-align: center;
        line-height: 1.2em;
        font-weight: 700;
        font-size: 0.9em;
    }
    mark {
        color: inherit;
        background: var(--p-cwe-markdown-mark-background-color);
    }
    @media print {
        mark {
            background: none;
            outline: solid 0.1em var(--p-cwe-markdown-mark-background-color);
        }
    }
    blockquote,
    dl,
    details {
        position: relative;
        border: 0.02em solid var(--p-cwe-markdown-blockquote-theme-color);
        border-left: 0.25em solid var(--p-cwe-markdown-blockquote-theme-color);
        background: none;
    }
    @media screen {
        blockquote::before,
        dl::before,
        details::before {
            content: '';
            position: absolute;
            z-index: -1;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            background-color: var(--p-cwe-markdown-blockquote-theme-color);
            opacity: 0.05;
        }
    }

    dt,
    summary {
        font-size: 1.2em;
        font-weight: bolder;
    }
    blockquote,
    details,
    dl,
    [is='md-container'] {
        position: relative;
        margin: 1em 0;
        padding: 0 0.8em 0 1.2em;
        page-break-inside: avoid;
    }
    table {
        min-width: 15em;
        border-spacing: 0;
        border-collapse: collapse;
        margin: 1.2em auto;
        text-align: left;
    }
    table > thead > tr > th {
        background-color: var(--p-cwe-markdown-table-header-background-color);
    }

    table td,
    table th {
        border: 1px solid var(--p-cwe-markdown-table-border-color);
        line-height: 1.5em;
        padding: 0.4em 0.8em;
    }
    table th {
        min-width: 4em;
    }
    .block-embed {
        display: -webkit-box;
        display: flex;
        width: 100%;
        max-width: 720px;
        margin: 1em auto;
        page-break-inside: avoid;
    }
    .block-embed > * {
        -webkit-box-flex: 1;
        flex: auto;
    }
    audio,
    canvas,
    iframe,
    img,
    svg,
    video {
        vertical-align: middle;
    }
    .block-embed-hint {
        display: none;
    }
    #sub-frame-error {
        -webkit-align-items: center;
        align-items: center;
        background-color: #ddd;
        display: -webkit-flex;
        -webkit-flex-flow: column;
        flex-flow: column;
        height: 100%;
        -webkit-justify-content: center;
        justify-content: center;
        left: 0;
        position: absolute;
        text-align: center;
        top: 0;
        transition: background-color 0.2s ease-in-out;
        width: 100%;
    }
    iframe,
    img {
        border-style: none;
    }
    .block-embed:before {
        display: block;
        padding-bottom: 60%;
        content: '';
    }
    pre {
        padding: 1em 0.5em;
        margin: 1.2em 0;
        border-radius: 4px;
        position: relative;
        font-size: 1em;
        overflow: auto;
        contain: content;
        border: solid 1px var(--p-cwe-markdown-pre-border-color);
        background-color: var(--p-cwe-markdown-pre-background-color);
    }
    pre > code {
        border: none;
    }
    cwe-highlight {
        border: solid 1px var(--p-cwe-markdown-pre-border-color);
        background-color: var(--p-cwe-markdown-pre-background-color);
    }
    code,
    kbd,
    pre,
    samp {
        font-family: ${codeFont};
    }
    pre:before {
        font-size: 0.8em;
        position: -webkit-sticky;
        position: sticky;
        display: block;
        left: 0;
        height: 0;
        -webkit-transform: translateY(-2em);
        transform: translateY(-2em);
    }
    figure {
        margin: 1em auto 0.75em;
        min-width: 240px;
        display: table;
        page-break-inside: avoid;
    }
    figure img {
        display: block;
        margin: auto;
    }
    figure > figcaption {
        display: table-caption;
        caption-side: bottom;
    }
    figcaption,
    caption {
        text-align: center;
        margin: 0.3em auto;
        font-weight: bolder;
        font-size: 0.8rem;
    }
    .text-align-center {
        text-align: center;
    }

    hr {
        margin: 0.5em -2px;
        padding: 0 2px;
        border: none;
        border-bottom: 1px solid var(--p-cwe-markdown-divider-color);
    }

    a.footnote-ref {
        user-select: none;
        display: inline-block;
        vertical-align: super;
        font-size: smaller;
        padding: 1px;
        text-decoration: none !important;
    }
    a.footnote-ref::before {
        content: '[';
        vertical-align: initial;
    }
    a.footnote-ref::after {
        content: ']';
        vertical-align: initial;
    }
    footer.footnotes {
        border-top: 1px solid var(--p-cwe-markdown-divider-color);
        margin: 3em -8px 1em;
        padding: 0 8px;
    }
    ol.footnotes-list {
        margin: 1em 0;
        counter-reset: footnotes;
        list-style: none;
    }
    li.footnote-item {
        margin: 0.8em 0;
        counter-increment: footnotes;
        position: relative;
    }
    li.footnote-item::before {
        text-align: end;
        position: absolute;
        transform: translateX(calc(-100% - 0.5em));
        content: '[' counter(footnotes) ']';
    }
    li.footnote-item p {
        margin: 0.5em 0;
    }
    a.footnote-backref {
        user-select: none;
        display: inline-block;
        margin: 4px;
    }
    a.footnote-backref::before {
        content: '↩\\fe0e';
    }
    @media print {
        a.footnote-backref {
            display: none;
        }
    }
`;
