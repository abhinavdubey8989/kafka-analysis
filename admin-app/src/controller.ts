
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';
import { Service } from './service';
import { Request, Response } from 'express';



export class Controller {

    private service: Service;
    private logService: LogService;

    constructor() {
        this.logService = LogService.getInstance();
        this.service = new Service();
    }


    async getAdminStats(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const stats: any = await this.service.getLagDetails(ctx);
        res.status(200).json({ logId: ctx.logId, data: stats });
    }

}
