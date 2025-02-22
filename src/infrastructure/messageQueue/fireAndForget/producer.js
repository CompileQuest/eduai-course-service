class Producer {
    constructor(channel) {
        this.channel = channel;
    }

    async produceMessage(queue, payload) {
        try {
            // Ensure the queue exists before publishing
            await this.channel.assertQueue(queue, { durable: true });

            // Send the message to the specified queue
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

            console.log(`Sent message to queue '${queue}':`, payload);
            return true;
        } catch (error) {
            console.error("Error producing message:", error);
            return false;
        }
    }
}

module.exports = Producer;
