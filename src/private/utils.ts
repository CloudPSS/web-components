const styleCache = new Map<string, string>();

/**
 * 加载样式
 */
export async function loadStyle(el: HTMLLinkElement | undefined, src: string, useBlob = true): Promise<void> {
    if (!el) {
        el = document.createElement('link');
        document.head.appendChild(el);
    }
    el.rel = 'stylesheet';
    el.crossOrigin = 'anonymous';
    if (!useBlob) {
        el.href = src;
        return;
    }
    let style = styleCache.get(src);
    if (style) {
        el.href = style;
        return;
    }
    try {
        const res = await fetch(src, { mode: 'cors' });
        if (res.ok) {
            const styleData = await res.blob();
            const url = URL.createObjectURL(styleData);
            styleCache.set(src, url);
        }
    } catch (ex) {
        styleCache.set(src, src);
    }
    style = styleCache.get(src);
    el.href = style ?? src;
}
