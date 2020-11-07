import MarkdownIt from 'markdown-it';
import { escapeHtml, unescapeAll } from 'markdown-it/lib/common/utils';
import { RenderRule } from 'markdown-it/lib/renderer';
import { slugify } from './utils';

import '../../chart';
import '../../mermaid';
import '../../highlight';

/**
 * 高亮
 */
const code_block: RenderRule = (tokens, idx, _options, _env, slf) => {
    const token = tokens[idx];
    const code = escapeHtml(token.content);
    return `<cwe-highlight ${slf.renderAttrs(token)} srcdoc="${code}"></cwe-highlight>\n`;
};

/**
 * 高亮
 */
const fence: RenderRule = (tokens, idx) => {
    const token = tokens[idx];
    const info = token.info ? unescapeAll(token.info).trim() : '';
    let lang = '';
    let title = '';

    if (info) {
        const arr = info.split(/(\s+)/g);
        lang = arr[0];
        title = arr.slice(2).join('').trim();
    }
    const code = escapeHtml(token.content);
    const htmlAttr = title ? `id="${escapeHtml(slugify(title))}" aria-label="${escapeHtml(title)}"` : '';

    switch (lang) {
        case 'mermaid':
            return `<cwe-mermaid config="${code}" ${htmlAttr}></cwe-mermaid>\n`;
        case 'chart':
            return `<cwe-chart ${htmlAttr} config="${code}"></cwe-chart>\n`;
        default: {
            const langAttr = lang ? `language="${escapeHtml(lang)}"` : '';
            return `<cwe-highlight ${htmlAttr} ${langAttr} srcdoc="${code}"></cwe-highlight>\n`;
        }
    }
};

/**
 * 使用自定义元素高亮
 */
export function markdownCustomElementHighlight(md: MarkdownIt): void {
    md.renderer.rules.fence = fence;
    md.renderer.rules.code_block = code_block;
}
