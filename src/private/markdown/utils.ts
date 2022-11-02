import type MarkdownIt from 'markdown-it';
import type { PluginWithParams } from 'markdown-it';

/**
 * 加载插件
 */
export function loadPlugin(plugin: unknown): PluginWithParams {
    if (typeof plugin == 'function') return plugin as PluginWithParams;
    const esm = plugin as { default: unknown };
    if (typeof esm.default == 'function') return esm.default as PluginWithParams;
    return plugin as PluginWithParams;
}

/**
 * 扩展插件
 */
export function extend(plugin: unknown, load: (md: MarkdownIt, usePlugin: () => void) => void): PluginWithParams {
    const p = loadPlugin(plugin);
    return (md, ...params: unknown[]) => {
        load(md, () => {
            md.use(p, ...params);
        });
    };
}

/**
 * 生成 id
 */
export function slugify(s: string): string {
    return String(s).trim().replace(/\s/g, '-').toLowerCase();
}

/**
 * 生成 data-source-line 属性
 */
export function sourceLine(token: import('markdown-it/lib/token.js')): string {
    if (token.map) return ` data-source-line="${token.map[0] + 1}"`;
    return '';
}

/**
 * 生成 data-source-line 属性
 */
export function sourceLineIncremental(token: import('markdown-it/lib/token.js')): unknown[] {
    if (token.map) return ['data-source-line', token.map[0] + 1];
    return [];
}
