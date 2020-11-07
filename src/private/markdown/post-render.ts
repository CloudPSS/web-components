import { slugify } from './utils';

/**
 * 一些必要的处理
 */
export function postRender(el: HTMLElement | DocumentFragment): void {
    el.querySelectorAll<HTMLTableCaptionElement>('table > caption').forEach((e) => {
        (e.parentElement as HTMLTableElement).id = slugify(e.innerText);
    });
    el.querySelectorAll<HTMLElement>('figure > figcaption').forEach((e) => {
        (e.parentElement as HTMLElement).id = slugify(e.innerText);
    });
    el.querySelectorAll<HTMLIFrameElement | HTMLVideoElement>('.block-embed > iframe, .block-embed > video').forEach(
        (e) => {
            (e.parentElement as HTMLElement).setAttribute('data-src', e.src);
        },
    );
}
