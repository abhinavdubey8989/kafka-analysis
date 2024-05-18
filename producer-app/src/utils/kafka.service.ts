

import { Ctx } from './ctx';
import os from 'os';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { LogService } from './logService';



export class KafkaProducer {

    private static instance: KafkaProducer;
    private kafka: Kafka;
    private producer: Producer;
    private logService: LogService;

    private constructor() {
        this.logService = LogService.getInstance();
        const serverId = process.env.SERVER_ID || `server_${os.hostname()}`;

        this.kafka = new Kafka({
            clientId: 'my-app',
            brokers: ['localhost:9092']
        });
        this.producer = this.kafka.producer();
        this.producer.connect();
    }

    public static getInstance() {
        if (!KafkaProducer.instance) {
            KafkaProducer.instance = new KafkaProducer();
        }
        return KafkaProducer.instance;
    }

    // public async connect(): Promise<void> {
    //     await this.producer.connect();
    // }

    public async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }

    public async send(ctx: Ctx, topic: string, message: any): Promise<void> {
        try {
            const record: ProducerRecord = {
                topic,
                messages: [{ value: JSON.stringify(message) }],
            };
            await this.producer.send(record);
        } catch (e) {
            this.logService.error(ctx, JSON.stringify(e));
        }
    }


}