/* eslint-disable */
import MarkdownIt from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer';
import type * as IncrementalDom from 'incremental-dom';
import Token from 'markdown-it/lib/token';
import renderer, { IncrementalRendererMixin } from './mixins/renderer';
import rules from './mixins/rules';
/**
 * @inheritdoc
 */
export type IncrementalRenderRuleRecord = {
    [p in keyof Renderer.RenderRuleRecord]: IncrementalRenderRule | undefined;
};
/**
 * incremental-dom 渲染
 */
export interface IncrementalRenderer
    extends Omit<Renderer, 'rules' | keyof IncrementalRendererMixin>,
        IncrementalRendererMixin {
    /**
     * @inheritdoc
     */
    rules: IncrementalRenderRuleRecord;
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

export interface IncrementalMarkdownIt extends MarkdownIt {
    renderToIncrementalDOM(src: string, env?: unknown): (a: unknown) => void;
    renderInlineToIncrementalDOM(src: string, env?: unknown): (a: unknown) => void;
    readonly IncrementalDOMRenderer: IncrementalRenderer;
}

export default function (md: IncrementalMarkdownIt, target: typeof IncrementalDom) {
    const incrementalDOM: typeof IncrementalDom = !target && window ? Reflect.get(window, 'IncrementalDOM') : target;
    const mixin = renderer(incrementalDOM);

    Object.defineProperty(md, 'IncrementalDOMRenderer', {
        get() {
            const extended = Object.assign(Object.create(Object.getPrototypeOf(md.renderer)), md.renderer, mixin);

            extended.rules = { ...extended.rules, ...rules(incrementalDOM) };

            return extended;
        },
    });

    md.renderToIncrementalDOM = (src, env = {}) =>
        md.IncrementalDOMRenderer.render(md.parse(src, env), md.options, env);

    md.renderInlineToIncrementalDOM = (src, env = {}) =>
        md.IncrementalDOMRenderer.render(md.parseInline(src, env), md.options, env);
}
