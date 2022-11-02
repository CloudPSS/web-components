import VideoServiceBase from './VideoServiceBase.js';

/**
 * TencentService
 */
export default class TencentService extends VideoServiceBase {
    /**
     * @inheritdoc
     */
    override extractVideoID(reference: string): string {
        const match = /x\/page\/([a-z0-9+])/i.exec(reference);
        return match && typeof match[1] === 'string' ? match[1] : reference;
    }
    /**
     * @inheritdoc
     */
    override getVideoUrl(videoID: string): string {
        return `https://v.qq.com/txp/iframe/player.html?vid=${videoID}&auto=0`;
    }
    /**
     * @inheritdoc
     */
    override getVideoHref(videoID: string): string {
        return `https://v.qq.com/x/page/${videoID}.html`;
    }
}
