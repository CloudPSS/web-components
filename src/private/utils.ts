import { Observable, fromEvent } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, mapTo } from 'rxjs/operators';

/**
 * 元素大小变化
 */
export function resizing(el: HTMLElement): Observable<void> {
    return fromEvent(window, 'resize').pipe(
        debounceTime(100),
        map(() => `${el.scrollWidth},${el.scrollHeight}`),
        distinctUntilChanged(),
        mapTo(undefined),
    );
}

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
        const res = await fetch(src);
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
