import { css } from 'lit-element';

export default css`
    img {
        max-width: 100%;
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
