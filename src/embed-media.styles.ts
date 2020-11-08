import { css } from 'lit-element';

export default css`
    :host {
        display: block;
        margin-block-start: 1em;
        margin-block-end: 1em;
        break-inside: avoid;
    }
    #container {
        margin: auto;
        display: flex;
        width: 100%;
        max-width: 720px;
    }
    #container > * {
        flex: auto;
    }
    #info {
        text-indent: -2em;
        padding-left: 2em;
        text-decoration: underline;
        line-height: 1;
    }
    #info::before {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='18' viewBox='0 0 18 18' width='18'%3E%3Cdefs%3E%3Cstyle%3E .a %7B fill: %236E6E6E; %7D %3C/style%3E%3C/defs%3E%3Ctitle%3ES VideoOutline 18 N%3C/title%3E%3Crect id='Canvas' fill='%23ff13dc' opacity='0' width='18' height='18' /%3E%3Cpath class='a' d='M15.5,2H2.5a.5.5,0,0,0-.5.5v13a.5.5,0,0,0,.5.5h13a.5.5,0,0,0,.5-.5V2.5A.5.5,0,0,0,15.5,2ZM5,14.75a.25.25,0,0,1-.25.25H3.25A.25.25,0,0,1,3,14.75v-1.5A.25.25,0,0,1,3.25,13h1.5a.25.25,0,0,1,.25.25Zm0-3.353a.25.25,0,0,1-.25.25H3.25a.25.25,0,0,1-.25-.25v-1.5a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25ZM5,8.103a.25.25,0,0,1-.25.25H3.25A.25.25,0,0,1,3,8.103v-1.5a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25ZM5,4.75A.25.25,0,0,1,4.75,5H3.25A.25.25,0,0,1,3,4.75V3.25A.25.25,0,0,1,3.25,3h1.5A.25.25,0,0,1,5,3.25ZM12,15H6V10h6Zm0-7H6V3h6Zm3,6.75a.25.25,0,0,1-.25.25h-1.5a.25.25,0,0,1-.25-.25v-1.5a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25Zm0-3.353a.25.25,0,0,1-.25.25h-1.5a.25.25,0,0,1-.25-.25v-1.5a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25Zm0-3.294a.25.25,0,0,1-.25.25h-1.5a.25.25,0,0,1-.25-.25v-1.5a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25ZM15,4.75a.25.25,0,0,1-.25.25h-1.5A.25.25,0,0,1,13,4.75V3.25A.25.25,0,0,1,13.25,3h1.5a.25.25,0,0,1,.25.25Z' /%3E%3C/svg%3E")
            no-repeat center / contain;
        content: '';
        width: 1.5em;
        height: 1.5em;
        margin-right: 0.5em;
        display: inline-block;
        vertical-align: middle;
    }
    @media screen {
        #container::before {
            display: block;
            padding-bottom: 60%;
            content: '';
        }
        #info {
            display: none;
        }
    }
    @media print {
        #container {
            display: none;
        }
    }
`;
