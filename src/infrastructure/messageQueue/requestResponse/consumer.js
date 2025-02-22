class Consumer {
    constructor(channel, rpcQueues) {
        this.channel = channel;
        this.rpcQueues = rpcQueues; // Array of queues
    }

    async consumeMessages() {
        console.log("Ready to consume messages...");

        for (const rpcQueue of this.rpcQueues) {
            this.channel.consume(
                rpcQueue,
                async (message) => {
                    const { correlationId, replyTo } = message.properties;
                    const operation = message.properties.headers.function;

                    if (!correlationId || !replyTo) {
                        console.log("Missing some properties...");
                    }
                    console.log("Consumed from queue:", rpcQueue, JSON.parse(message.content.toString()));
                    await MessageHandler.handle(
                        operation,
                        JSON.parse(message.content.toString()),
                        correlationId,
                        replyTo
                    );
                },
                {
                    noAck: true,
                }
            );
        }
    }
}

module.exports = Consumer;