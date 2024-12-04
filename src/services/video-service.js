const VideoRepository = require('../database/repository/video-repository');
const { APIError } = require('../utils/app-errors');

class VideoService {
    constructor() {
        this.repository = new VideoRepository();
    }

    async AddVideo(videoDetails) {
        return await this.repository.AddVideo(videoDetails);
    }

    async FetchAllVideos() {
        return await this.repository.FetchAllVideos();
    }

    async FetchVideoById(videoId) {
        return await this.repository.FetchVideoById(videoId);
    }

    async DeleteVideoById(videoId) {
        return await this.repository.DeleteVideoById(videoId);
    }

    async UpdateVideo(videoId, updates) {
        return await this.repository.UpdateVideoById(videoId, updates);
    }
}

module.exports = VideoService;
