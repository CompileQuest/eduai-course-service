// messageTemplate.js
module.exports = class Message {
    constructor(type, source, payload, metadata = {}) {
        this.id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Unique ID
        this.type = type; // Message type (e.g., "user.deleted", "video.delete")
        this.timestamp = new Date().toISOString(); // Current timestamp
        this.source = source; // Source of the message
        this.payload = payload; // Main data payload
        this.metadata = { retries: 0, priority: "normal", ...metadata }; // Default metadata
    }
};

// Example usage:
// const Message = require('./messageTemplate');
// const msg = new Message('video.delete', 'video-service', { videoId: 'vid-123' });
// console.log(JSON.stringify(msg, null, 2));
