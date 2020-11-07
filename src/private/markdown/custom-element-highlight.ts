import type MarkdownIt from 'markdown-it';
import { unescapeAll } from 'markdown-it/lib/common/utils';
import { slugify, sourceLineIncremental } from './utils';
import { elementVoid } from 'incremental-dom';
import { IncrementalRenderRule, IncrementalRenderRuleRecord } from './incremental-dom';

import '../../chart';
import '../../mermaid';
import '../../highlight';

/**
 * 高亮
 */
const code_block: IncrementalRenderRule = (tokens, idx, _options, _env, slf) => {
    return () => {
        const token = tokens[idx];
        elementVoid(
            'cwe-highlight',
            '',
            [],
            ...sourceLineIncremental(token),
            ...slf.renderAttrsToArray(token),
            'srcdoc',
            token.content,
        );
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
                elementVoid(
                    'cwe-mermaid',
                    title || code,
                    [],
                    ...sourceLineIncremental(token),
                    'config',
                    code,
                    ...htmlAttr,
                );
                return;
            case 'chart':
                elementVoid(
                    'cwe-chart',
                    title || code,
                    [],
                    ...sourceLineIncremental(token),
                    'config',
                    code,
                    ...htmlAttr,
                );
                return;
            default: {
                const langAttr = lang ? ['language', lang] : [];
                elementVoid(
                    'cwe-highlight',
                    title || code,
                    [],
                    ...sourceLineIncremental(token),
                    'srcdoc',
                    code,
                    ...langAttr,
                    ...htmlAttr,
                );
                return;
            }
        }
    };
};

/**
 * 使用自定义元素高亮
 */
export function markdownCustomElementHighlight(md: MarkdownIt): void {
    const rules = md.renderer.rules as IncrementalRenderRuleRecord;
    rules.fence = fence;
    rules.code_block = code_block;
}
