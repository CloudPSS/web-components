import { css } from 'lit-element';

export default css`
    :host {
        --cwe-markdown-link-default-color: blue;
        --cwe-markdown-header-default-color: #1a237e;
        --cwe-markdown-pre-background-color: #f2f2f2;
        --cwe-markdown-code-color: #f50057;
        --cwe-markdown-code-border-color: #c8c8c8;
        --cwe-markdown-code-bg-color: #f2f2f2;
        --cwe-markdown-blockquote-bg-color: rgba(140, 158, 255, 0.05);
        --cwe-markdown-blockquote-bd-left-color: #5c6bc0;
        --cwe-markdown-blockquote-bd-color: rgba(83, 109, 254, 0.2);
        --cwe-markdown-mark-bg-color: rgba(255, 214, 0, 0.4);
        --cwe-markdown-table-lastChild-th-color: #e1e1e1;
        --cwe-markdown-table-th-color: #c8c8c8;
        --cwe-markdown-a-hover-color: #303f9f;
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
        color: var(--cwe-markdown-header-default-color);
        font-weight: 600;
    }
    a {
        text-decoration: none;
        color: var(--cwe-markdown-link-default-color);
    }
    a:hover {
        color: var(--cwe-markdown-a-hover-color);
    }
    footer.footnotes {
        border-top: 1px solid var(--theme-foreground-divider);
        margin: 3em -8px 1em;
        padding: 0 8px;
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
        color: var(--cwe-markdown-code-color);
        font-size: 0.9em;
        border-color: var(--cwe-markdown-blockquote-bd-color);
        background-color: var(--cwe-markdown-code-bg-color);
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
            border: 0.05em solid var(--cwe-markdown-code-bg-color);
        }
        cwe-highlight:before {
            top: 3em !important;
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
        background: var(--cwe-markdown-mark-bg-color);
    }
    blockquote,
    dl,
    details {
        background-color: var(--cwe-markdown-blockquote-bg-color);
        border: 0.02em solid var(--cwe-markdown-blockquote-bd-color);
        border-left: 0.25em solid var(--cwe-markdown-blockquote-bd-left-color);
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
    table > thead > tr:nth-last-child(2n) > th {
        background-color: var(--cwe-markdown-table-lastChild-th-color);
    }
    table > thead > tr > th {
        background-color: var(--cwe-markdown-table-th-color);
    }

    table td,
    table th {
        border: 1px solid var(--cwe-markdown-table-th-color);
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
        background-color: #ddd;
        display: -webkit-flex;
        -webkit-flex-flow: column;
        height: 100%;
        -webkit-justify-content: center;
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
        padding: 2em 0.5em 1em;
        margin: 1.2em 0;
        border-radius: 4px;
        position: relative;
        font-size: 1em;
        overflow: auto;
        contain: content;
        background-color: var(--cwe-markdown-pre-background-color);
    }
    cwe-highlight {
        background-color: var(--cwe-markdown-pre-background-color);
        position: relative;
    }
    cwe-highlight:before {
        content: attr(title);
        font-size: 0.8em;
        position: -webkit-sticky;
        position: absolute;
        display: block;
        left: 0.2em;
        top: 2em;
        height: 0;
        -webkit-transform: translateY(-2em);
        transform: translateY(-2em);
        color: #1a237e;
    }
    code,
    kbd,
    pre,
    samp {
        font-family: Menlo, Consolas, Roboto Mono, 'Ubuntu Monospace', Noto Mono, Oxygen Mono, Liberation Mono,
            monospace, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
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
`;
