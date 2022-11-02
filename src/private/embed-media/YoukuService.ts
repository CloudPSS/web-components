import VideoServiceBase from './VideoServiceBase.js';

/**
 * YoukuService
 */
export default class YoukuService extends VideoServiceBase {
    /**
     * @inheritdoc
     */
    override extractVideoID(reference: string): string {
        const match = /id_([a-z0-9+])/i.exec(reference);
        return match && typeof match[1] === 'string' ? match[1] : reference;
    }
    /**
     * @inheritdoc
     */
    override getVideoUrl(videoID: string): string {
        return `https://player.youku.com/embed/${videoID}`;
    }
    /**
     * @inheritdoc
     */
    override getVideoHref(videoID: string): string {
        return `https://v.youku.com/v_show/id_${videoID}.html`;
    }
}
