/* eslint-disable */
import type * as IncrementalDom from 'incremental-dom';
import type { IncrementalRenderRuleRecord } from '..';

export default function (incrementalDom: typeof IncrementalDom): IncrementalRenderRuleRecord {
    const { elementClose, elementOpen, elementVoid, text } = incrementalDom;

    return {
        code_inline(tokens, idx, options, env, slf) {
            return () => {
                elementOpen('code', '', [], ...slf.renderAttrsToArray(tokens[idx]));
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
