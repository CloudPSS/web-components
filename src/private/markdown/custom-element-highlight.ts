import type MarkdownIt from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer';
import type { RenderRuleRecord } from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';
import { unescapeAll } from 'markdown-it/lib/common/utils';
import { slugify } from './utils';
import { elementVoid } from 'incremental-dom';

import '../../chart';
import '../../mermaid';
import '../../highlight';

/**
 * @inheritdoc
 */
type IncrementalRenderRuleRecord = {
    [p in keyof RenderRuleRecord]: IncrementalRenderRule | undefined;
};
/**
 * incremental-dom 渲染
 */
interface IncrementalRenderer extends Omit<Renderer, 'rules'> {
    /**
     * 渲染属性为数组
     */
    renderAttrsToArray(token: Token): string[];
    /**
     * @inheritdoc
     */
    rules: IncrementalRenderRuleRecord;
}

/**
 * incremental-dom 渲染函数
 */
type IncrementalRenderRule = (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    env: unknown,
    slf: IncrementalRenderer,
) => () => void;

/**
 * 高亮
 */
const code_block: IncrementalRenderRule = (tokens, idx, _options, _env, slf) => {
    return () => {
        const token = tokens[idx];
        elementVoid('cwe-highlight', '', [], ...slf.renderAttrsToArray(token), 'srcdoc', token.content);
    };
};

/**
 * 高亮
 */
const fence: IncrementalRenderRule = (tokens, idx, _options, _env, _slf) => {
    return () => {
        const token = tokens[idx];
        const info = token.info ? unescapeAll(token.info).trim() : '';
        let lang = '';
        let title = '';

        if (info) {
            const arr = info.split(/(\s+)/g);
            lang = arr[0];
            title = arr.slice(2).join('').trim();
        }
        const code = token.content;
        const htmlAttr = title ? ['id', slugify(title), 'aria-label', title] : [];

        switch (lang) {
            case 'mermaid':
                elementVoid('cwe-mermaid', '', [], 'config', code, ...htmlAttr);
                return;
            case 'chart':
                elementVoid('cwe-chart', '', [], 'config', code, ...htmlAttr);
                return;
            default: {
                const langAttr = lang ? ['language', lang] : [];
                elementVoid('cwe-highlight', '', [], 'srcdoc', code, ...langAttr, ...htmlAttr);
                return;
            }
        }
    };
};

/**
 * 使用自定义元素高亮
 */
export function markdownCustomElementHighlight(md: MarkdownIt): void {
    const renderer = md.renderer as IncrementalRenderer;
    renderer.rules.fence = fence;
    renderer.rules.code_block = code_block;
}
