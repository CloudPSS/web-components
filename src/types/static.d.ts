declare module '*.scss?inline' {
    const cssValue: string;
    export default cssValue;
}

declare module '*.scss?lit' {
    import { CSSResult } from '@lit/reactive-element';
    const cssValue: CSSResult;
    export default cssValue;
}
