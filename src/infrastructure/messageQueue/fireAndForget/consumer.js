const { parse } = require('dotenv');
const MessageHandler = require('../messageHandler');
const { ServerDescriptionChangedEvent } = require('mongodb');

class Consumer {
    constructor(channel, queues) {
        this.channel = channel;
        this.queues = queues;
        this.messageHandler = new MessageHandler();
    }

    async consumeMessages() {
        try {
            for (const queue of this.queues) {
                await this.channel.consume(queue, async (msg) => {
                    if (msg !== null) {
                        console.log(`Received message from queue ${queue}:`, msg.content.toString());

                        // Parse the message
                        const parsedMessage = this.parseMessage(msg.content.toString());

                        // Process the message using MessageHandler
                        if (parsedMessage) {
                            this.messageHandler.handleMessage(parsedMessage.type, parsedMessage.payload);
                        }

                        // Acknowledge the message (deletes it from the queue)
                        this.channel.ack(msg);
                    }
                });
            }
        } catch (error) {
            console.error("Error consuming messages:", error);
        }
    }

    async consumeTest() {
        try {
            for (const queue of this.queues) {
                await this.channel.consume(queue, async (msg) => {
                    if (msg !== null) {
                        // Parse the message
                        const parsedMessage = this.parseMessage(msg.content.toString());
                        //console.dir(parsedMessage, { depth: null, colors: true })
                        // Process the message using MessageHandler
                        if (parsedMessage) {
                            this.messageHandler.handleMessage(parsedMessage.type, parsedMessage.payload);
                        }

                        // Do NOT acknowledge the message (it stays in the queue)
                    }
                }, { noAck: true }); // Prevents messages from being deleted
            }
        } catch (error) {
            console.error("Error in test consumption:", error);
        }
    }

    parseMessage(message) {
        try {
            return JSON.parse(message); // Convert string to JSON object
        } catch (error) {
            console.error("Failed to parse message:", error);
            return null;
        }
    }
}

module.exports = Consumer;
