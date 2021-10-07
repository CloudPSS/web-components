import VideoServiceBase from './VideoServiceBase';

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
        return `//player.youku.com/embed/${videoID}`;
    }
}
