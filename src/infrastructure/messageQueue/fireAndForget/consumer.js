class Consumer {
    constructor(channel, queues) {
        this.channel = channel;
        this.queues = queues;
    }

    async consumeMessages() {
        try {
            for (const queue of this.queues) {
                await this.channel.consume(queue, async (msg) => {
                    if (msg !== null) {
                        console.log(`Received message from queue ${queue}:`, msg.content.toString());

                        // Simulating message processing
                        const response = this.processMessage(msg.content.toString());
                        this.channel.ack(msg);
                    }
                });
            }
        } catch (error) {
            console.error("Error consuming messages:", error);
        }
    }

    processMessage(message) {
        // Simulate processing logic
        console.log("Processing message:", message);
        return `Processed: ${message}`;
    }
}

module.exports = Consumer;
