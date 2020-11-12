/* eslint-disable */
import { Parser } from 'htmlparser2/lib/Parser';
import { sourceLineIncremental } from '../../utils';
import type * as IncrementalDom from 'incremental-dom';
import type Token from 'markdown-it/lib/token';
import type MarkdownIt from 'markdown-it';
import type { IncrementalRenderer } from '..';

/**
 * incremental-dom 渲染
 */
export interface IncrementalRendererMixin {
    renderAttrsToArray(token: Token): string[];
    renderToken(tokens: Token[], idx: number, options: MarkdownIt.Options, env: unknown): () => void;
    renderInline(tokens: Token[], options: MarkdownIt.Options, env: unknown): () => void;
    render(tokens: Token[], options: MarkdownIt.Options, env: unknown): () => void;
}

/**
 * incremental-dom 渲染函数
 */
export type IncrementalRenderRule = (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    env: unknown,
    slf: IncrementalRenderer,
) => () => void;

export default function (
    incrementalDom: typeof IncrementalDom,
): IncrementalRendererMixin & ThisType<IncrementalRenderer> {
    const autoClosingStack: IncrementalDom.NameOrCtorDef[][] = [];

    const autoClosing = () => {
        const stack = autoClosingStack.shift();
        if (!stack) return;

        stack.reverse().forEach((tag) => incrementalDom.elementClose(tag));
    };

    const { attr, elementOpenEnd, elementVoid, text } = incrementalDom;

    const elementOpen: typeof IncrementalDom['elementOpen'] = (tag, ...args) => {
        if (autoClosingStack.length > 0) autoClosingStack[0].push(tag);
        return incrementalDom.elementOpen(tag, ...args);
    };

    const elementOpenStart: typeof IncrementalDom['elementOpenStart'] = (tag) => {
        if (autoClosingStack.length > 0) autoClosingStack[0].push(tag);
        return incrementalDom.elementOpenStart(tag);
    };

    const elementClose: typeof IncrementalDom['elementClose'] = (tag) => {
        if (autoClosingStack.length > 0) autoClosingStack[0].pop();
        return incrementalDom.elementClose(tag);
    };

    const sanitizeName = (name: string) => name.replace(/[^-:\w]/g, '');

    const iDOMParser = new Parser(
        {
            onopentag: () => elementOpenEnd(),
            onopentagname: (name) => elementOpenStart(sanitizeName(name)),
            onattribute: (name, value) => {
                const sanitizedName = sanitizeName(name);
                if (sanitizedName !== '') attr(sanitizedName, value);
            },
            ontext: text,
            onclosetag: (name) => elementClose(sanitizeName(name)),
        },
        {
            decodeEntities: true,
            lowerCaseAttributeNames: false,
            lowerCaseTags: false,
        },
    );

    const wrapIncrementalDOM = (html: string | (() => void)) => {
        if (typeof html === 'function') return html();
        if (typeof html === 'string') {
            if (!html) return;
            return iDOMParser.write(html);
        }
        throw new Error('Invalid html, neither string or render function');
    };

    return {
        renderAttrsToArray(token: Token): string[] {
            if (!token.attrs) return [];
            return token.attrs.reduce((v, a) => v.concat(a), [] as string[]);
        },

        renderInline(tokens: Token[], options: MarkdownIt.Options, env: unknown) {
            return () => {
                autoClosingStack.unshift([]);
                tokens.forEach((current, i) => {
                    const { type } = current;
                    const rule = this.rules[type];
                    if (rule != null) {
                        wrapIncrementalDOM(rule(tokens, i, options, env, this));
                    } else {
                        this.renderToken(tokens, i, options, env)();
                    }
                });
                autoClosing();
            };
        },

        renderToken(tokens, idx, _env) {
            return () => {
                const token = tokens[idx];
                if (token.hidden) return;

                if (token.nesting === -1) {
                    elementClose(token.tag);
                } else {
                    const func = token.nesting === 0 ? elementVoid : elementOpen;
                    func(token.tag, '', [], ...sourceLineIncremental(token), ...this.renderAttrsToArray(token));
                }
            };
        },

        render(tokens, options, env) {
            return () => {
                autoClosingStack.unshift([]);
                tokens.forEach((current, i) => {
                    const { type } = current;

                    if (type === 'inline') {
                        if (current.children) this.renderInline(current.children, options, env)();
                    } else if (this.rules[type] != undefined) {
                        wrapIncrementalDOM(this.rules[type]!(tokens, i, options, env, this));
                    } else {
                        this.renderToken(tokens, i, options, env)();
                    }
                });
                autoClosing();
                iDOMParser.reset();
            };
        },
    };
}
