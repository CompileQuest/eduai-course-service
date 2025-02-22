const { connect } = require("amqplib");
const config = require("./config");
const Consumer = require("./consumer");
const Producer = require("./producer");


class RabbitMQClient {
    constructor() {
        if (RabbitMQClient.instance) {
            return RabbitMQClient.instance;
        }

        this.isInitialized = false;
        this.producer = null;
        this.consumer = null;
        this.connection = null;
        this.producerChannel = null;
        this.consumerChannel = null;

        RabbitMQClient.instance = this;
    }

    static getInstance() {
        if (!RabbitMQClient.instance) {
            RabbitMQClient.instance = new RabbitMQClient();
        }
        return RabbitMQClient.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            console.log("instance of rabbit client exited ", this.isInitialized);
            return;
        }

        try {
            this.connection = await connect(config.rabbitMQ.url);
            this.producerChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            // Assert multiple queues
            const rpcQueues = [];
            for (const queueName of config.rabbitMQ.queues.rpcQueues) {
                const { queue } = await this.consumerChannel.assertQueue(queueName, { exclusive: true });
                rpcQueues.push(queue);
            }

            this.producer = new Producer(this.producerChannel);
            this.consumer = new Consumer(this.consumerChannel, rpcQueues);

            this.consumer.consumeMessages();

            this.isInitialized = true;
            console.log("created a new instance of client rabbit");

        } catch (error) {
            console.log("RabbitMQ error...", error);
        }
    }

    async produce(data, correlationId, replyToQueue) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return await this.producer.produceMessages(
            data,
            correlationId,
            replyToQueue
        );
    }
}

module.exports = RabbitMQClient.getInstance();