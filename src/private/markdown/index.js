import markdownIt from 'markdown-it';
import * as incrementalDOM from 'incremental-dom';
import { extend, loadPlugin, slugify, sourceLineIncremental } from './utils';

import '../../math';

import markdownItEmoji from 'markdown-it-emoji';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItMath from './math';
import markdownItDeflist from 'markdown-it-deflist';
import markdownItAbbr from 'markdown-it-abbr';
import markdownItIns from 'markdown-it-ins';
import markdownItKbd from 'markdown-it-kbd';
import markdownItMark from 'markdown-it-mark';
import markdownItImsize from './imsize';
import markdownItMultimdTable from 'markdown-it-multimd-table';
import markdownItCenterText from 'markdown-it-center-text';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItFrontMatter from 'markdown-it-front-matter';
import markdownItImplicitFigures from 'markdown-it-implicit-figures';
import markdownItEmbedMedia from './embed-media';
import markdownItContainer from 'markdown-it-container';
import markdownItIncrementalDOM from './incremental-dom';
import { markdownCustomElementHighlight } from './custom-element-highlight';

/**
 * 创建 markdownIt
 * @param {import('./incremental-dom').IncrementalMarkdownRenderOptions} options 选项
 * @returns {import('./incremental-dom').IncrementalMarkdownIt} markdownIt
 */
export default function (options) {
    options = Object.assign(
        {
            html: true,
            typographer: true,
        },
        options,
    );
    /** @type {import('./incremental-dom').IncrementalMarkdownIt} */
    let md = markdownIt(options);

    /**
     * @type {Array<[string, { validate?(params:string): boolean; render?: import('./incremental-dom').IncrementalRenderRule; marker?: string; }]>}
     */
    const containers = [
        [
            'summary',
            {
                render: (tokens, idx, opt, env /*, slf*/) => {
                    return () => {
                        const token = tokens[idx];
                        const m = /^\S+\s+(.*)$/.exec(token.info.trim());
                        const summary = m?.[1];

                        if (token.nesting === 1) {
                            incrementalDOM.elementOpen('details', '', [], ...sourceLineIncremental(token));
                            if (summary) {
                                incrementalDOM.elementOpen('summary', '', []);
                                md.renderInline(summary, {
                                    ...env,
                                    footnotes: null,
                                })();
                                incrementalDOM.elementClose('summary');
                            }
                        } else {
                            incrementalDOM.elementClose('details');
                        }
                    };
                },
            },
        ],
        ...['tip', 'question', 'error', 'warning', 'info', 'success', 'fail'].map((name) => [
            name,
            {
                /**
                 * @type {import('./incremental-dom').IncrementalRenderRule}
                 */
                render: (tokens, idx, opt, env /*, slf*/) => {
                    return () => {
                        const token = tokens[idx];
                        const m = /^\S+\s+(.*)$/.exec(token.info.trim());
                        const summary = m?.[1];

                        if (token.nesting === 1) {
                            incrementalDOM.elementOpen(
                                'div',
                                '',
                                [],
                                'is',
                                'md-container',
                                'class',
                                name,
                                ...sourceLineIncremental(token),
                            );
                            if (summary) {
                                incrementalDOM.elementOpen('summary', '', []);
                                md.renderInline(summary, {
                                    ...env,
                                    footnotes: null,
                                })();
                                incrementalDOM.elementClose('summary');
                            }
                        } else {
                            incrementalDOM.elementClose('div');
                        }
                    };
                },
            },
        ]),
    ];

    /** @type {[import('markdown-it').PluginWithParams, ...any][]} */
    const plugins = [
        [markdownItEmoji],
        [markdownItSub],
        [markdownItSup],
        [
            extend(markdownItFootnote, (md, use) => {
                use();
                md.renderer.rules.footnote_block_open = () => {
                    return () => {
                        incrementalDOM.elementOpen(
                            'footer',
                            'footnotes',
                            [],
                            'class',
                            'footnotes',
                            'aria-label',
                            'Footnotes',
                        );
                        incrementalDOM.elementOpen('ol', 'footnotes-list', [], 'class', 'footnotes-list');
                    };
                };
                md.renderer.rules.footnote_block_close = () => {
                    return () => {
                        incrementalDOM.elementClose('ol');
                        incrementalDOM.elementClose('footer');
                    };
                };
                md.renderer.rules.footnote_anchor_name = (tokens, idx, options, env /*, slf*/) => {
                    var label = slugify(tokens[idx].meta.label ?? Number(tokens[idx].meta.id + 1).toString());
                    var prefix = '';
                    if (typeof env.docId === 'string') {
                        prefix = env.docId + '-';
                    }
                    return prefix + label;
                };
                md.renderer.rules.footnote_caption = (tokens, idx /*, options, env, slf*/) => {
                    return Number(tokens[idx].meta.id + 1).toString();
                };
                md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
                    return () => {
                        const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
                        const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
                        let refid = id;

                        if (tokens[idx].meta.subId > 0) {
                            refid += '::' + (tokens[idx].meta.subId + 1);
                        }
                        const href = md.normalizeLink(`#fn-${id}`);
                        incrementalDOM.elementOpen(
                            'a',
                            '',
                            [],
                            'id',
                            `fnref-${refid}`,
                            'href',
                            href,
                            'class',
                            'footnote-ref',
                            'aria-label',
                            'Go to footnote',
                            'aria-describedby',
                            `fn-${id}`,
                        );
                        incrementalDOM.text(caption);
                        incrementalDOM.elementClose('a');
                    };
                };
                md.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
                    return () => {
                        let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
                        if (tokens[idx].meta.subId > 0) {
                            id += '::' + tokens[idx].meta.subId;
                        }
                        incrementalDOM.elementOpen('li', '', [], 'id', `fn-${id}`, 'class', 'footnote-item');
                    };
                };
                md.renderer.rules.footnote_close = () => {
                    return () => {
                        incrementalDOM.elementClose('li');
                    };
                };
                md.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
                    return () => {
                        let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
                        if (tokens[idx].meta.subId > 0) {
                            id += '::' + (tokens[idx].meta.subId + 1);
                        }
                        const href = md.normalizeLink(`#fnref-${id}`);
                        incrementalDOM.elementVoid(
                            'a',
                            '',
                            [],
                            'href',
                            href,
                            'class',
                            'footnote-backref',
                            'aria-label',
                            'Back to article',
                        );
                    };
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
                inlineRenderer: (content) => {
                    return () => {
                        incrementalDOM.elementVoid(
                            'cwe-math',
                            content,
                            [],
                            'language',
                            'tex',
                            'mode',
                            'inline',
                            'srcdoc',
                            content,
                        );
                    };
                },
                blockRenderer: (content, token) => {
                    return () => {
                        incrementalDOM.elementVoid(
                            'cwe-math',
                            content,
                            [],
                            ...sourceLineIncremental(token),
                            'language',
                            'tex',
                            'mode',
                            'display',
                            'srcdoc',
                            content,
                        );
                    };
                },
            },
        ],
        [markdownItDeflist],
        [markdownItAbbr],
        [markdownItIns],
        [markdownItKbd],
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
        [
            markdownItAnchor,
            {
                slugify: slugify,
                permalink: markdownItAnchor.permalink.ariaHidden({
                    symbol: '',
                    space: false,
                    renderHref: (slug, { md }) => md.normalizeLink(`#${slug}`),
                }),
            },
        ],
        [
            markdownItFrontMatter,
            (rawMeta) => {
                md.options.frontMatter?.(rawMeta);
            },
        ],
        [markdownItImplicitFigures, { figcaption: true }],
        [markdownItEmbedMedia],
        ...containers.map((v) => [markdownItContainer, ...v]),
        [markdownCustomElementHighlight],
        [markdownItIncrementalDOM, incrementalDOM],
    ];
    md = plugins.reduce((i, [plugin, ...options]) => {
        return i.use(loadPlugin(plugin), ...options);
    }, md);

    return md;
}
