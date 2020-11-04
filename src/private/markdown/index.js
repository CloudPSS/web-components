import markdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import VideoServiceBase from 'markdown-it-block-embed/lib/services/VideoServiceBase';
import { extend, loadPlugin, slugify, sourceLine } from './utils';
import './post-render';

import '../../chart';
import '../../mermaid';
import '../../highlight';
import '../../math';

import * as markdownItEmoji from 'markdown-it-emoji';
import * as markdownItSub from 'markdown-it-sub';
import * as markdownItSup from 'markdown-it-sup';
import * as markdownItFootnote from 'markdown-it-footnote';
import * as markdownItMath from 'markdown-it-math';
import * as markdownItDeflist from 'markdown-it-deflist';
import * as markdownItAbbr from 'markdown-it-abbr';
import * as markdownItIns from 'markdown-it-ins';
import * as markdownItMark from 'markdown-it-mark';
import * as markdownItImsize from './imsize';
import * as markdownItMultimdTable from 'markdown-it-multimd-table';
import * as markdownItCenterText from 'markdown-it-center-text';
import * as markdownItKbd from 'markdown-it-kbd';
import * as markdownItAnchor from 'markdown-it-anchor';
import * as markdownItFrontMatter from 'markdown-it-front-matter';
import * as markdownItImplicitFigures from 'markdown-it-implicit-figures';
import * as markdownItBlockEmbed from 'markdown-it-block-embed';
import * as markdownItContainer from 'markdown-it-container';
import * as markdownItSourceMap from 'markdown-it-source-map';

/**
 *
 */
function loadCustomHighlights() {
    return (string, lang, attr) => {
        const code = escapeHtml(string);
        attr = (attr ?? '').trim();
        const htmlAttr = attr ? `id="${escapeHtml(slugify(attr))}" title="${escapeHtml(attr)}"` : '';
        switch (lang) {
            case 'mermaid':
                return `<pre remove-it><cwe-mermaid config="${code}" ${htmlAttr}></cwe-mermaid></pre>`;
            case 'chart':
                return `<pre remove-it><cwe-chart ${htmlAttr} config="${code}"></cwe-chart></pre>`;
            default: {
                const langAttr = lang ? `language="${escapeHtml(lang)}"` : '';
                return `<pre remove-it><cwe-highlight ${htmlAttr} ${langAttr} srcdoc="${code}"></cwe-highlight></pre>`;
            }
        }
    };
}

/**
 * @param {markdownIt.Options & {frontMatter: (fm:string)=>void}} options
 *
 * @returns {markdownIt.MarkdownItExt}
 */
export default function (options) {
    options = Object.assign(
        {
            html: true,
            typographer: true,
            frontMatter: () => {},
        },
        options,
    );
    if (options.highlight == null && customElements) {
        options.highlight = loadCustomHighlights();
    }
    let md = markdownIt(options);

    /** @type {Array<[string, {
     *      validate?(params:string): boolean;
     *      render?(tokens: import('markdown-it/lib/token')[], idx: number, opt: markdownIt.Options, env: object): string;
     *      marker?: string;
     * }]>} */
    const containers = [
        [
            'summary',
            {
                render(tokens, idx, opt, env /*, slf*/) {
                    const token = tokens[idx];
                    const m = token.info.trim().match(/^\S+\s+(.*)$/);
                    const summary = m?.[1];

                    if (token.nesting === 1) {
                        const detailsOpen = `<details ${sourceLine(token)}>\n`;
                        if (summary) {
                            return `${detailsOpen}<summary>${md.renderInline(summary, {
                                ...env,
                                footnotes: null,
                            })}</summary>\n`;
                        } else {
                            return detailsOpen;
                        }
                    } else {
                        return '</details>\n';
                    }
                },
            },
        ],
        ...['tip', 'question', 'error', 'warning', 'info', 'success', 'fail'].map(
            /**
             * @returns {[string, {
             *      validate?(params:string): boolean;
             *      render?(tokens: import('markdown-it/lib/token')[], idx: number, opt: markdownIt.Options, env: object): string;
             *      marker?: string;
             * }]}
             * */ (name) => [
                name,
                {
                    /**
                     * @param {import('markdown-it/lib/token')[]} tokens
                     */
                    render(tokens, idx, opt, env /*, slf*/) {
                        const token = tokens[idx];
                        const m = token.info.trim().match(/^\S+\s+(.*)$/);
                        const summary = m?.[1];

                        if (token.nesting === 1) {
                            const divOpen = `<div is="md-container" class="${escapeHtml(name)}" ${sourceLine(
                                token,
                            )}>\n`;
                            if (summary) {
                                return `${divOpen}<summary>${md.renderInline(summary, {
                                    ...env,
                                    footnotes: null,
                                })}</summary>\n`;
                            } else {
                                return divOpen;
                            }
                        } else {
                            return '</div>\n';
                        }
                    },
                },
            ],
        ),
    ];
    /** @type {[import('markdown-it').PluginWithParams, ...any][]} */
    const plugins = [
        [markdownItEmoji],
        [markdownItSub],
        [markdownItSup],
        [
            extend(markdownItFootnote, (md, use) => {
                use();
                md.renderer.rules.footnote_block_open = function render_footnote_block_open() {
                    return `<footer class="footnotes" aria-label="Footnotes">\n<ol class="footnotes-list">\n`;
                };
                md.renderer.rules.footnote_block_close = function render_footnote_block_close() {
                    return '</ol>\n</footer>\n';
                };
                md.renderer.rules.footnote_anchor_name = function render_footnote_anchor_name(
                    tokens,
                    idx,
                    options,
                    env /*, slf*/,
                ) {
                    var label = slugify(tokens[idx].meta.label ?? Number(tokens[idx].meta.id + 1).toString());
                    var prefix = '';

                    if (typeof env.docId === 'string') {
                        prefix = env.docId + '-';
                    }

                    return prefix + label;
                };
                md.renderer.rules.footnote_caption = function render_footnote_caption(
                    tokens,
                    idx /*, options, env, slf*/,
                ) {
                    return Number(tokens[idx].meta.id + 1).toString();
                };
                md.renderer.rules.footnote_ref = function render_footnote_ref(tokens, idx, options, env, slf) {
                    const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
                    const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
                    let refid = id;

                    if (tokens[idx].meta.subId > 0) {
                        refid += '::' + (tokens[idx].meta.subId + 1);
                    }
                    const href = md.normalizeLink(`#fn-${id}`);
                    const linkId = escapeHtml(`fnref-${refid}`);
                    return (
                        `<a id="${linkId}" href="${href}" class="footnote-ref" ` +
                        `aria-label="Go to footnote" aria-describedby="fn-${escapeHtml(id)}">${caption}</a>`
                    );
                };
                md.renderer.rules.footnote_open = function render_footnote_open(tokens, idx, options, env, slf) {
                    var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

                    if (tokens[idx].meta.subId > 0) {
                        id += '::' + tokens[idx].meta.subId;
                    }

                    return `<li id="fn-${escapeHtml(id)}"" class="footnote-item">`;
                };
                md.renderer.rules.footnote_anchor = function render_footnote_anchor(tokens, idx, options, env, slf) {
                    var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

                    if (tokens[idx].meta.subId > 0) {
                        id += '::' + (tokens[idx].meta.subId + 1);
                    }
                    const href = md.normalizeLink(`#fnref-${id}`);
                    return `<a href="${href}" class="footnote-backref" aria-label="Back to article"></a>`;
                };
            }),
        ],
        [
            markdownItMath,
            {
                inlineOpen: '$',
                inlineClose: '$',
                blockOpen: '$$',
                blockClose: '$$',
                inlineRenderer: (content, token) => {
                    return `<cwe-math ${sourceLine(token)} language="tex" mode="inline" srcdoc="${escapeHtml(
                        content,
                    )}"></cwe-math>`;
                },
                blockRenderer: (content, token) => {
                    return `<cwe-math ${sourceLine(token)} language="tex" mode="display" srcdoc="${escapeHtml(
                        content,
                    )}"></cwe-math>`;
                },
            },
        ],
        [markdownItDeflist],
        [markdownItAbbr],
        [markdownItIns],
        [markdownItMark],
        [markdownItImsize],
        [
            markdownItMultimdTable,
            {
                multiline: true,
                rowspan: true,
                headerless: true,
            },
        ],
        [markdownItCenterText],
        [markdownItKbd],
        [
            markdownItAnchor,
            {
                slugify: slugify,
                permalink: true,
                permalinkSpace: false,
                permalinkSymbol: '',
                permalinkHref: (slug) => md.normalizeLink(`#${slug}`),
                permalinkAttrs: (slug) => ({ 'aria-label': slug }),
            },
        ],
        [markdownItFrontMatter, options.frontMatter],
        [markdownItImplicitFigures, { figcaption: true }],
        [
            extend(markdownItBlockEmbed, (md, use) => {
                use();
                const original = md.renderer.rules['video'];
                md.renderer.rules['video'] = (tokens, idx, opt, env, slf) => {
                    const ret = original(tokens, idx, opt, env, slf);
                    return `<div ${sourceLine(tokens[idx])} ` + ret.slice('<div'.length);
                };
            }),
            {
                outputPlayerSize: false,
                services: {
                    bilibili: class extends VideoServiceBase {
                        /** @param {string} reference */
                        extractVideoID(reference) {
                            let match = reference.match(
                                /https?:\/\/(?:www\.|player\.)?bilibili.com\/(?:player.html\?aid=|player.html\?bvid=|video\/)([a-z0-9]+)/i,
                            );
                            const id = match && typeof match[1] === 'string' ? match[1] : reference;
                            if (id.match(/^\d+$/)) return `av${id}`;
                            return id;
                        }
                        /** @param {string} videoID */
                        getVideoUrl(videoID) {
                            const id = videoID.match(/^(av|bv|)(.*)$/i);
                            let idArg;
                            if (id[1] != null && id[1].toLowerCase() === 'bv') {
                                idArg = 'bvid=' + id[0];
                            }
                            if (id[1] != null && id[1].toLowerCase() === 'av') {
                                idArg = 'aid=' + id[2];
                            }
                            if (id[1] == '') {
                                idArg = 'aid=' + id[2];
                            }
                            return `//player.bilibili.com/player.html?${idArg}&as_wide=1&high_quality=1&danmaku=0`;
                        }
                    },
                    youku: class extends VideoServiceBase {
                        /** @param {string} reference */
                        extractVideoID(reference) {
                            let match = reference.match(/id_([a-z0-9+])/i);
                            return match && typeof match[1] === 'string' ? match[1] : reference;
                        }
                        /** @param {string} videoID */
                        getVideoUrl(videoID) {
                            return `//player.youku.com/embed/${videoID}`;
                        }
                    },
                    tencent: class extends VideoServiceBase {
                        /** @param {string} reference */
                        extractVideoID(reference) {
                            let match = reference.match(/x\/page\/([a-z0-9+])/i);
                            return match && typeof match[1] === 'string' ? match[1] : reference;
                        }
                        /** @param {string} videoID */
                        getVideoUrl(videoID) {
                            return `//v.qq.com/txp/iframe/player.html?vid=${videoID}&auto=0`;
                        }
                    },
                },
            },
        ],
        ...containers.map((v) => [markdownItContainer, ...v]),
        [markdownItSourceMap],
    ];
    md = plugins.reduce((i, [plugin, ...options]) => {
        return i.use(loadPlugin(plugin), ...options);
    }, md);

    return md;
}
