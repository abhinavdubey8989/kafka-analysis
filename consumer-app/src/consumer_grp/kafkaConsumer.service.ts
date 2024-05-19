

import { Ctx } from '../utils/ctx';
import os from 'os';
import { Kafka, Consumer, Admin } from 'kafkajs';
import { LogService } from '../utils/logService';


export interface TopicMap {
    [partition: string]: number;
}

export interface TopicOffsetMap {
    [topic: string]: TopicMap;
}

export interface ConsumerGroupOffsetMap {
    [consumerGroup: string]: TopicOffsetMap;
}

export interface ConsumerGroupWiseLagMap {
    [consumerGroup: string]: { [topic: string]: number };
}

export interface TopicWiseLagMap {
    [topic: string]: number;
}


export class KafkaConsumer {

    private kafka: Kafka;
    private consumer: Consumer;
    private logService: LogService;
    private sleepSeconds: number;
    private kafkaAdmin: Admin;


    constructor(consumerGroupId: string, topics: string[], sleepSeconds: number) {
        this.logService = LogService.getInstance();
        this.sleepSeconds = sleepSeconds;
        try {
            const brokers = process.env.KAFKA_BROKER_STR!.split(',')
            this.kafka = new Kafka({
                clientId: process.env.APP_NAME,
                brokers
            });
            this.consumer = this.kafka.consumer({ groupId: consumerGroupId });
            this.kafkaAdmin = this.kafka.admin();
            this.kafkaAdmin.connect();
            this.startConsuming(topics)
        } catch (e) {
            console.log(JSON.stringify(e));
            this.kafka = {} as any;
            this.consumer = {} as any;
            this.kafkaAdmin = {} as any;

        }
    }

    public async disconnect(): Promise<void> {
        await this.consumer.disconnect();
    }

    private async startConsuming(topics: string[]) {
        try {
            await this.consumer.subscribe({ topics, fromBeginning: true });
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const msgString = message!.value!.toString();
                    const msgObj = JSON.parse(msgString);
                    this.logService.info(
                        { logId: msgObj.logId },
                        JSON.stringify({
                            partition,
                            offset: message.offset,
                            value: msgString,
                        }));
                    await this.sleep(this.sleepSeconds * 1000);
                },
            });
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    }


    private sleep(timeInMillisec: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeInMillisec));
    }
}