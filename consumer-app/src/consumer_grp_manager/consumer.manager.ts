
import { LogService } from '../utils/logService';
import { Ctx } from '../utils/ctx';
import { KafkaConsumer } from '../consumer_grp/kafkaConsumer.service';
import { Request, Response } from 'express';

export class ConsumerGroupManager {

    private consumerGroupMap: Map<string, KafkaConsumer>;
    private logService: LogService;

    constructor() {
        this.logService = LogService.getInstance();
        this.consumerGroupMap = new Map<string, KafkaConsumer>();
    }



    async addConsumerGroups(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { newConsumers } = req.body;
        const addedConsumerGroups: string[] = [];

        for (const newConsumer of newConsumers) {
            const { groupId, topicsToRead, sleepSeconds } = newConsumer as any;
            // if (this.consumerGroupMap.has(groupId)) {
            //     continue;
            // }
            const newConsumerGroup = new KafkaConsumer(groupId, topicsToRead, sleepSeconds);
            this.consumerGroupMap.set(groupId, newConsumerGroup);
            addedConsumerGroups.push(groupId);
        }
        res.status(201).json({ logId: ctx.logId, data: { addedConsumerGroups } });
    }


    async deleteConsumerGroups(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { newConsumers } = req.body;
        const deletedConsumerGroups: string[] = [];
        for (const newConsumer of newConsumers) {
            const { groupId } = newConsumer as any;
            if (!this.consumerGroupMap.has(groupId)) {
                continue;
            }
            const existingConsumerGroup = this.consumerGroupMap.get(groupId);
            existingConsumerGroup!.disconnect();
            deletedConsumerGroups.push(groupId);
        }
        res.status(200).json({ logId: ctx.logId, data: { deletedConsumerGroups } });
    }

    async getConsumerGroups(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const currentConsumerGroups: string[] = Array.from(this.consumerGroupMap.keys());
        res.status(200).json({ logId: ctx.logId, data: { currentConsumerGroups } });
    }

}
