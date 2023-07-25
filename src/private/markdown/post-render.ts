import { slugify } from './utils.js';

/**
 * 一些必要的处理
 */
export function postRender(el: HTMLElement | DocumentFragment): void {
    el.querySelectorAll<HTMLTableCaptionElement>('table > caption').forEach((e) => {
        (e.parentElement as HTMLTableElement).id = slugify(e.textContent ?? '');
    });
    el.querySelectorAll<HTMLElement>('figure > figcaption').forEach((e) => {
        e.parentElement!.id = slugify(e.textContent ?? '');
    });
}
