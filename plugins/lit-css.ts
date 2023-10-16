import type { PluginOption } from 'vite';

const cssRE = /^const __vite__css = (".+")$/m;
const cssDefRE = /^export default (".+")$/m;

const hot = `
import { supportsAdoptingStyleSheets } from 'lit'
if (import.meta.hot) {
    import.meta.hot.data.instance ??= cssStyle;
    import.meta.hot.accept((newModule) => {
        console.log(newModule)
        const result = import.meta.hot.data.instance
        if (!supportsAdoptingStyleSheets || !result) {
            return import.meta.hot.invalidate()
        }
        if (newModule) {
            const newResult = newModule.default
            result.cssText = newResult.cssText
            if (result._styleSheet) {
                newResult._styleSheet = result._styleSheet
                try {
                    result._styleSheet.replaceSync(newResult.cssText)
                } catch {
                    // ignore css error on replacing
                }
            }
        }
    })
}`;

/** 生成 lit CSSResult */
export default function litCss(): PluginOption {
    let isProduction = false;
    return {
        name: 'transform-css',
        enforce: 'post',
        configResolved(config) {
            isProduction = !!config.isProduction;
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
                code: `import { unsafeCSS } from 'lit'

const cssStyle = unsafeCSS(${css})
${!isProduction ? hot : ''}
export default cssStyle`,
                map: null,
            };
        },
    };
}
