import type { PluginOption } from 'vite';

const cssRE = /^const __vite__css = (".+")$/m;
const cssDefRE = /^export default (".+")$/m;

const makeHmr = (specifier = 'lit') => /* ts */ `
import { supportsAdoptingStyleSheets } from '${specifier}';

if (import.meta.hot) {
    import.meta.hot.data.instance ??= cssStyle;
    import.meta.hot.accept((newModule) => {
        const result = import.meta.hot.data.instance;
        if (!supportsAdoptingStyleSheets || !result) {
            return import.meta.hot.invalidate();
        }
        if (newModule) {
            const newResult = newModule.default;
            result.cssText = newResult.cssText;
            if (result._styleSheet) {
                newResult._styleSheet = result._styleSheet;
                try {
                    result._styleSheet.replaceSync(newResult.cssText);
                } catch {
                    // ignore css error on replacing
                }
            }
        }
    });
}
`;

const makeModule = (css: string, hot: boolean, specifier = 'lit') => /* ts */ `
import { unsafeCSS } from '${specifier}';

const cssStyle = unsafeCSS(${JSON.stringify(css)});

${hot ? makeHmr(specifier) : ''}

export default cssStyle;
`;

/** 生成 lit CSSResult */
export default function litCss(): PluginOption {
    let isProduction = false;
    return {
        name: 'transform-lit-css',
        enforce: 'post',
        configResolved(config) {
            isProduction = !!config.isProduction;
            console.log(config);
        },
        transform(src, id) {
            // fast check to skip non-css files
            if (id.startsWith('\0')) return undefined;
            if (!id.includes('lit')) return undefined;

            let css: string | undefined;
            const url = new URL('file://' + id);
            if (url.searchParams.has('lit')) {
                const content = cssRE.exec(src) ?? cssDefRE.exec(src);
                css = content?.[1];
            }
            if (!css) return undefined;
            return {
                code: makeModule(JSON.parse(css), !isProduction),
                map: null,
            };
        },
    };
}
