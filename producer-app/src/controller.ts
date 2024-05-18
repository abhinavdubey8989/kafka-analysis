
import { Request, Response } from 'express';
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';
import { KafkaProducer } from './utils/kafka.service';

export class UserController {

    private kafkaProducer: KafkaProducer;
    private logService: LogService;

    constructor() {
        this.kafkaProducer = KafkaProducer.getInstance();
        this.logService = LogService.getInstance();
    }

    async addUser(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { id, name, count } = req.body;
        const user = { id, name, count };
        await this.kafkaProducer.send(ctx , "abc" , user);
        res.status(201).json({ logId: ctx.logId, data: `User updated successfully` });
    }
}
