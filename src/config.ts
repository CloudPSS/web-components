import { BehaviorSubject } from 'rxjs';

let _styler: (el: HTMLElement) => string;
let _resolver: (pkg: string, version: string, file: string) => string;

/**
 * 解析包地址
 */
export function resolve(pkg: string, version: string, file: string): string {
    file = file.replace(/^\//, '');
    if (_resolver) return _resolver(pkg, version, file);
    return `https://unpkg.com/${pkg}@${version}/${file}`;
}
/**
 * 样式
 */
export function style(el: HTMLElement): string {
    return _styler?.(el) ?? '';
}

/**
 * 设置包解析
 */
export function setResolver(resolver: (pkg: string, version: string, file: string) => string): void {
    _resolver = resolver;
}
/**
 * 设置样式
 */
export function setStyle(styler: (el: HTMLElement) => string): void {
    _styler = styler;
}

/** 设置主题 */
export const theme = new BehaviorSubject<'dark' | 'light'>('light');
