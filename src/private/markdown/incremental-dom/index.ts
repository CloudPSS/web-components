import MarkdownIt from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer.js';
import type * as IncrementalDom from 'incremental-dom';
import Token from 'markdown-it/lib/token.js';
import renderer, { IncrementalRendererMixin } from './mixins/renderer.js';
import rules from './mixins/rules.js';

/** incremental-dom 渲染结果 */
export type IncrementalTemplate = () => void;

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
) => IncrementalTemplate;

/** incremental-dom MarkdownIt */
export interface IncrementalMarkdownIt extends Omit<MarkdownIt, 'render' | 'renderInline' | 'renderer'> {
    /** @inheritdoc */
    render(src: string, env?: unknown): IncrementalTemplate;
    /** @inheritdoc */
    renderInline(src: string, env?: unknown): IncrementalTemplate;
    /** @inheritdoc */
    renderer: IncrementalRenderer;
}

/** 创建 IncrementalMarkdownIt */
export default function (markdownIt: MarkdownIt, target: unknown): IncrementalMarkdownIt {
    const md = markdownIt as unknown as IncrementalMarkdownIt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const incrementalDOM: typeof IncrementalDom = !target && window ? Reflect.get(window, 'IncrementalDOM') : target;
    const mixin = renderer(incrementalDOM);

    const originalRenderer = markdownIt.renderer;
    const incrementalRenderer = Object.assign(
        Object.create(Object.getPrototypeOf(originalRenderer) as Renderer),
        md.renderer,
        mixin,
    ) as IncrementalRenderer;
    incrementalRenderer.rules = { ...incrementalRenderer.rules, ...rules(incrementalDOM) };

    Object.defineProperties(md, {
        renderer: { value: incrementalRenderer, configurable: true, writable: true },
        originalRenderer: { value: originalRenderer, configurable: true, writable: true },
    });
    return md;
}
