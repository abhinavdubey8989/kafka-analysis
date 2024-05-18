
import { Request, Response } from 'express';
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';
import { KafkaProducer } from './utils/kafkaProducer.service';

export class UserController {

    private kafkaProducer: KafkaProducer;
    private logService: LogService;

    constructor() {
        this.kafkaProducer = KafkaProducer.getInstance();
        this.logService = LogService.getInstance();
    }

    async addUser(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { id, name, count , topic } = req.body;
        const user = { id, name, count };
        await this.kafkaProducer.send(ctx , topic , user);
        res.status(201).json({ logId: ctx.logId, data: `User updated successfully` });
    }
}
