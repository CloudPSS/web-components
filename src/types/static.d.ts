declare module '*.scss?inline' {
    const cssValue: string;
    export default cssValue;
}

declare module '*.scss?lit&inline' {
    import { CSSResult } from 'lit';
    const cssValue: CSSResult;
    export default cssValue;
}
