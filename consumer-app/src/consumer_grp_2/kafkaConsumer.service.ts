

import { Ctx } from '../utils/ctx';
import os from 'os';
import { Kafka, Consumer } from 'kafkajs';
import { LogService } from '../utils/logService';



export class KafkaConsumer2 {

    private static instance: KafkaConsumer2;
    private kafka: Kafka;
    private consumer: Consumer;
    private logService: LogService;

    private constructor() {
        this.logService = LogService.getInstance();
        try {
            const brokers = process.env.KAFKA_BROKER_STR!.split(',')
            this.kafka = new Kafka({
                clientId: process.env.APP_NAME,
                brokers
            });
            this.consumer = this.kafka.consumer({ groupId: process.env.GRP_2_CONSUMER_GROUP_ID! });
        } catch (e) {
            console.log(JSON.stringify(e));
            this.kafka = {} as any;
            this.consumer = {} as any;
        }
    }

    public static getInstance() {
        if (!KafkaConsumer2.instance) {
            KafkaConsumer2.instance = new KafkaConsumer2();
        }
        return KafkaConsumer2.instance;
    }

    public async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }

    public async getConsumer() {
        return this.consumer;
    }
}