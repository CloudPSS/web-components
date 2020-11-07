import markdownIt from 'markdown-it';
import VideoServiceBase from 'markdown-it-block-embed/lib/services/VideoServiceBase';
import { extend, loadPlugin, slugify, sourceLine, sourceLineIncremental } from './utils';

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
import * as incrementalDOM from 'incremental-dom';
import * as markdownItIncrementalDOM from './incremental-dom';
import { markdownCustomElementHighlight } from './custom-element-highlight';

/**
 * @param {markdownIt.Options & {frontMatter: (fm:string)=>void}} options
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
    /** @type { markdownItIncrementalDOM.IncrementalMarkdownIt } */
    let md = markdownIt(options);

    /** @type {Array<[string, {
     *      validate?(params:string): boolean;
     *      render?: markdownItIncrementalDOM.IncrementalRenderRule;
     *      marker?: string;
     * }]>} */
    const containers = [
        [
            'summary',
            {
                render: (tokens, idx, opt, env /*, slf*/) => {
                    return () => {
                        const token = tokens[idx];
                        const m = token.info.trim().match(/^\S+\s+(.*)$/);
                        const summary = m?.[1];

                        if (token.nesting === 1) {
                            incrementalDOM.elementOpen('details', '', [], ...sourceLineIncremental(token));
                            if (summary) {
                                incrementalDOM.elementOpen('summary', '', []);
                                md.renderInlineToIncrementalDOM(summary, {
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
                 * @type {markdownItIncrementalDOM.IncrementalRenderRule}
                 */
                render: (tokens, idx, opt, env /*, slf*/) => {
                    return () => {
                        const token = tokens[idx];
                        const m = token.info.trim().match(/^\S+\s+(.*)$/);
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
                                md.renderInlineToIncrementalDOM(summary, {
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
                        incrementalDOM.elementOpen('footer', '', [], 'class', 'footnotes', 'aria-label', 'Footnotes');
                        incrementalDOM.elementOpen('ol', '', [], 'class', 'footnotes-list');
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
            extend(markdownItMath, (md, use) => {
                use();
                md.renderer.rules.math_inline = (tokens, idx) => {
                    return () => {
                        incrementalDOM.elementVoid(
                            'cwe-math',
                            '',
                            [],
                            'language',
                            'tex',
                            'mode',
                            'inline',
                            'srcdoc',
                            tokens[idx].content,
                        );
                    };
                };
                md.renderer.rules.math_block = (tokens, idx) => {
                    return () => {
                        incrementalDOM.elementVoid(
                            'cwe-math',
                            '',
                            [],
                            ...sourceLineIncremental(tokens[idx]),
                            'language',
                            'tex',
                            'mode',
                            'display',
                            'srcdoc',
                            tokens[idx].content,
                        );
                    };
                };
            }),
            {
                inlineOpen: '$',
                inlineClose: '$',
                blockOpen: '$$',
                blockClose: '$$',
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
        [markdownCustomElementHighlight],
        [markdownItIncrementalDOM, incrementalDOM],
    ];
    md = plugins.reduce((i, [plugin, ...options]) => {
        return i.use(loadPlugin(plugin), ...options);
    }, md);

    return md;
}
