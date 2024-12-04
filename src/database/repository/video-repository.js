const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class VideoRepository {
    async AddVideo(videoDetails) {
        try {
            return await prisma.video.create({
                data: videoDetails,
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Video');
        }
    }

    async FetchAllVideos() {
        try {
            return await prisma.video.findMany({
                include: {
                    Section: true,
                }
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Videos');
        }
    }

    async FetchVideoById(videoId) {
        try {
            const video = await prisma.video.findUnique({
                where: { video_id: videoId.trim() },
                include: {
                    Section: true,
                }
            });
            if (!video) throw new Error('Video Not Found');
            return video;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Video');
        }
    }

    async DeleteVideoById(videoId) {
        try {
            const video = await prisma.video.delete({
                where: { video_id: videoId.trim() },
            });
            if (!video) throw new Error('Video Not Found');
            return video;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Video');
        }
    }

    async UpdateVideoById(videoId, updates) {
        try {
            const video = await prisma.video.update({
                where: { video_id: videoId.trim() },
                data: updates,
            });
            if (!video) throw new Error('Video Not Found');
            return video;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Video');
        }
    }
}

module.exports = VideoRepository;
