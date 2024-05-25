
import { LogService } from '../utils/logService';
import { Ctx } from '../utils/ctx';
import { KafkaConsumer } from '../consumer_grp/kafkaConsumer.service';
import { Request, Response } from 'express';

export class ConsumerGroupManager {

    private consumerGroupMap: Map<string, KafkaConsumer[]>;
    private logService: LogService;

    constructor() {
        this.logService = LogService.getInstance();
        this.consumerGroupMap = new Map<string, KafkaConsumer[]>();
    }

    async addConsumerGroups(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { newConsumers } = req.body;
        const addedConsumerGroups: string[] = [];

        for (const newConsumer of newConsumers) {
            const { groupId, topicsToRead, sleepSeconds, allowMultiple } = newConsumer as any;
            if (this.consumerGroupMap.has(groupId) && !allowMultiple) {
                continue;
            }

            if (!this.consumerGroupMap.has(groupId)) {
                this.consumerGroupMap.set(groupId, []);
            }

            const newConsumerGroup = new KafkaConsumer(groupId, topicsToRead, sleepSeconds);
            this.consumerGroupMap.get(groupId)!.push(newConsumerGroup);
            addedConsumerGroups.push(groupId);
        }
        const data = await this.getConsumerGroups(req, res, true);
        res.status(201).json({ logId: ctx.logId, data });
    }


    async deleteConsumerGroups(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { listOfConsumerGroupToRemove } = req.body;
        const deletedConsumerGroups: string[] = [];

        for (const cgToRemove of listOfConsumerGroupToRemove) {
            if (!this.consumerGroupMap.has(cgToRemove)) {
                continue;
            }
            const cgList = this.consumerGroupMap.get(cgToRemove);
            for (const cg of cgList!) {
                cg.disconnect();
            }
            deletedConsumerGroups.push(cgToRemove);
        }

        const data = await this.getConsumerGroups(req, res, true);
        res.status(200).json({ logId: ctx.logId, data });
    }

    async getConsumerGroups(req: Request, res: Response, internal: boolean = false) {
        const ctx: Ctx = res.locals.ctx;
        const data: any = {};
        const cgList = Array.from(this.consumerGroupMap.keys());
        for (const cg of cgList) {
            const listOfConsumers = this.consumerGroupMap.get(cg) || [];
            data[cg] = {
                size: listOfConsumers.length,
            }
        }

        // return val
        if (internal) {
            return data;
        } else {
            res.status(200).json({ logId: ctx.logId, data });
        }

    }

}
