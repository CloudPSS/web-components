import VideoServiceBase from './VideoServiceBase';

/**
 * BilibiliService
 */
export default class BilibiliService extends VideoServiceBase {
    /**
     * @inheritdoc
     */
    extractVideoID(reference: string): string {
        const match = /https?:\/\/(?:www\.|player\.)?bilibili.com\/(?:player.html\?aid=|player.html\?bvid=|video\/)([a-z0-9]+)/i.exec(
            reference,
        );
        const id = match && typeof match[1] === 'string' ? match[1] : reference;
        if (/^\d+$/.test(id)) return `av${id}`;
        return id;
    }
    /**
     * @inheritdoc
     */
    getVideoUrl(videoID: string): string {
        const id = /^(av|bv|)(.*)$/i.exec(videoID);
        if (!id) throw new Error('Invalid video id');
        let idArg;
        if (id[1] != null && id[1].toLowerCase() === 'bv') {
            idArg = 'bvid=' + id[0];
        }
        if (id[1] != null && id[1].toLowerCase() === 'av') {
            idArg = 'aid=' + id[2];
        }
        if (id[1] === '') {
            idArg = 'aid=' + id[2];
        }
        if (!idArg) throw new Error('Invalid video id');
        return `//player.bilibili.com/player.html?${idArg}&as_wide=1&high_quality=1&danmaku=0`;
    }
}
