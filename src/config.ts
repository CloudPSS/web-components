export let _resolver = (pkg: string, version: string, file: string): string => {
    file = file.replace(/^\//, '');
    return `https://unpkg.com/${pkg}@${version}/${file}`
}

export function setResolver(resolver: (pkg: string, version: string, file: string) => string): void{
    _resolver = resolver;
}