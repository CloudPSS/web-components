/* eslint-disable */
import type * as IncrementalDom from 'incremental-dom';
import type { IncrementalRenderRuleRecord } from '../index.js';

export default function (target: unknown): IncrementalRenderRuleRecord {
    const { elementClose, elementOpen, elementVoid, text } = target as typeof IncrementalDom;

    return {
        code_inline(tokens, idx, options, env, slf) {
            return () => {
                elementOpen('code', tokens[idx].content, [], ...slf.renderAttrsToArray(tokens[idx]));
                text(tokens[idx].content);
                elementClose('code');
            };
        },

        hardbreak() {
            return () => elementVoid('br');
        },

        softbreak(tokens, idx, options) {
            return () => (options.breaks ? elementVoid('br') : text('\n'));
        },

        text(tokens, idx) {
            return () => text(tokens[idx].content);
        },

        emoji(tokens, idx) {
            return () => text(tokens[idx].content);
        },
    };
}
