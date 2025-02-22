class Producer {
    constructor(channel) {
        this.channel = channel;
        this.pendingResponses = new Map();
        this.activeConsumers = new Map();
    }

    consumeReplyQueue(replyQueue) {
        if (this.activeConsumers.has(replyQueue)) {
            return;
        }

        this.channel.consume(replyQueue, (message) => {
            const { correlationId } = message.properties;
            if (this.pendingResponses.has(correlationId)) {
                const resolve = this.pendingResponses.get(correlationId);
                resolve(JSON.parse(message.content.toString()));
                this.pendingResponses.delete(correlationId);
            }
        }, { noAck: true });

        this.activeConsumers.set(replyQueue, true);
    }

    async produceAndWait(data, correlationId, targetQueue, replyToQueue, timeoutMs = 5000) {
        await this.createNamedTemporaryQueue(replyToQueue, timeoutMs); // Create a temporary queue with a name
        await this.consumeReplyQueue(replyToQueue); // Start listening on that queue

        return new Promise((resolve, reject) => {
            this.pendingResponses.set(correlationId, resolve);

            this.channel.sendToQueue(
                targetQueue,
                Buffer.from(JSON.stringify(data)),
                { correlationId, replyTo: replyToQueue }
            );

            setTimeout(() => {
                if (this.pendingResponses.has(correlationId)) {
                    this.pendingResponses.delete(correlationId);
                    reject(new Error(`Timeout: No response for ${correlationId} after ${timeoutMs}ms`));
                }
            }, timeoutMs);
        });
    }

    async createNamedTemporaryQueue(replyToQueue, timeoutMs) {
        await this.channel.assertQueue(replyToQueue, {
            exclusive: false, // Must be false to allow naming
            durable: false,
            autoDelete: true,
            arguments: { "x-expires": timeoutMs }
        });
    }

    produceAndForget(data, targetQueue) {
        this.channel.sendToQueue(targetQueue, Buffer.from(JSON.stringify(data)));
        console.log(`Message sent to ${targetQueue}, no reply expected.`);
    }
}
