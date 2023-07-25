/* eslint-disable */
import MarkdownIt from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer.js';
import type * as IncrementalDom from 'incremental-dom';
import Token from 'markdown-it/lib/token.js';
import renderer, { IncrementalRendererMixin } from './mixins/renderer.js';
import rules from './mixins/rules.js';
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

export interface IncrementalMarkdownIt extends Omit<MarkdownIt, 'render' | 'renderInline'> {
    render(src: string, env?: unknown): () => void;
    renderInline(src: string, env?: unknown): () => void;
}

export default function (md: IncrementalMarkdownIt, target: unknown) {
    const incrementalDOM: typeof IncrementalDom = !target && window ? Reflect.get(window, 'IncrementalDOM') : target;
    const mixin = renderer(incrementalDOM);

    const incrementalRenderer = Object.assign(
        Object.create(Object.getPrototypeOf(md.renderer)),
        md.renderer,
        mixin,
    ) as IncrementalRenderer;
    incrementalRenderer.rules = { ...incrementalRenderer.rules, ...rules(incrementalDOM) };

    md.render = function (src, env = {}) {
        return incrementalRenderer.render(this.parse(src, env), this.options, env);
    };
    md.renderInline = function (src, env = {}) {
        return incrementalRenderer.render(this.parseInline(src, env), this.options, env);
    };
}
