
import { LogService } from '../utils/logService';
import { Ctx } from '../utils/ctx';
import { KafkaConsumer2 } from './kafkaConsumer.service';

export class Consumer2 {

    private kafkaConsumer: KafkaConsumer2;
    private logService: LogService;

    constructor() {
        this.kafkaConsumer = KafkaConsumer2.getInstance();
        this.logService = LogService.getInstance();
        this.startConsuming();
    }

    async startConsuming() {
        const consumer = await this.kafkaConsumer.getConsumer();
        const topic = process.env.GRP_2_KAFKA_TOPIC!;
        consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const msgString = message!.value!.toString();
                const msgObj = JSON.parse(msgString);
                this.logService.info(
                    { logId: msgObj.logId },
                    JSON.stringify({
                        partition,
                        offset: message.offset,
                        value: msgString,
                    }))
            },
        })


    }
}
