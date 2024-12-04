const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = (app) => {
    // Error handler middleware
    const errorHandler = (err, req, res, next) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return res.status(400).json({ message: 'Duplicate entry found.' });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ message: 'Video not found.' });
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: 'Validation error in Prisma request.' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    };

    // Add a new video
    app.post('/videos/add-video', async (req, res, next) => {
        try {
            const {
                section_id,
                video_id,
                video_url,
                video_duration,
                is_locked,
                is_previewable
            } = req.body;

            // Check if video already exists
            const existingVideo = await prisma.video.findUnique({
                where: { video_id }
            });
            if (existingVideo) {
                return res.status(400).json({ message: 'Video with this ID already exists' });
            }

            // Create the video
            const newVideo = await prisma.video.create({
                data: {
                    section_id,
                    video_id,
                    video_url,
                    video_duration,
                    is_locked,
                    is_previewable
                }
            });

            res.status(201).json(newVideo);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Get all videos
    app.get('/videos/all', async (req, res, next) => {
        try {
            const videos = await prisma.video.findMany({
                include: {
                    Section: true,
                }
            });
            res.status(200).json(videos);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    app.get('/videos/all/:sectionId', async (req, res, next) => {
      const { sectionId } = req.params;  // Get the section ID from the URL parameter
      try {
          const videos = await prisma.video.findMany({
              where: {
                  section_id: parseInt(sectionId)  // Ensure section_id is an integer
              },
              include: {
                  Section: true,
              }
          });
          if (videos.length === 0) {
              return res.status(404).json({ message: `No videos found for section ID ${sectionId}` });
          }
          res.status(200).json(videos);
      } catch (err) {
          next(err); // Pass error to the error handler
      }
  });
  

    // Get a specific video by ID
    app.get('/videos/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const video = await prisma.video.findUnique({
                where: { id: parseInt(id) },
                include: {
                    Section: true,
                }
            });
            if (!video) {
                return res.status(404).json({ message: 'Video not found' });
            }
            res.status(200).json(video);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Delete a specific video by ID
    app.delete('/videos/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const deletedVideo = await prisma.video.delete({
                where: { id: parseInt(id) }
            });
            res.status(200).json({ message: 'Video deleted', deletedVideo });
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Update a specific video by ID
    app.put('/videos/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                section_id,
                video_id,
                video_url,
                video_duration,
                is_locked,
                is_previewable
            } = req.body;

            const updateData = {
                section_id,
                video_id,
                video_url,
                video_duration,
                is_locked,
                is_previewable
            };

            const updatedVideo = await prisma.video.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.status(200).json(updatedVideo);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Use the error handler
    app.use(errorHandler);
};
