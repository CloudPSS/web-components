declare module 'katex/dist/katex.mjs' {
    import katex from 'katex';
    const katexMjs: typeof katex & {
        version: string;
    };
    export default katexMjs;
}
