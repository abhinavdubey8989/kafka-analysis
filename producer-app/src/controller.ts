
import { Request, Response } from 'express';
import { ReturnVal, UserService } from './service';
import { User } from './model';
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';

export class UserController {

    private userService: UserService;
    private logService: LogService;

    constructor() {
        this.userService = new UserService();
        this.logService = LogService.getInstance();
    }

    async addUser(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const { id, name, count } = req.body;
        const user: User = { id, name, count };
        await this.userService.addUser(res.locals.ctx, user);
        res.status(201).json({ logId: ctx.logId, data: `User updated successfully` });

    }

    async updateUser(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const userId = +req.params.userId;
        const { name, count } = req.body;
        const user: User = { id: userId, name, count };
        await this.userService.updateUser(res.locals.ctx, user);
        res.status(200).json({ logId: ctx.logId, data: `User updated successfully` });

    }

    async updateUserCount(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const userId = +req.params.userId;
        const txnFlag = +req.params.txnFlag;

        let serviceResp: ReturnVal = { hasError: true, data: 'invalid txnFlag !!' };
        if (txnFlag === 1) {
            this.logService.info(ctx, `txnFlag=[${txnFlag}] , calling zk`)
            serviceResp = await this.userService.updateUserCountUsingZookeeper(res.locals.ctx, userId);
        } if (txnFlag === 2) {
            this.logService.info(ctx, `txnFlag=[${txnFlag}] , calling redis`)
            serviceResp = await this.userService.updateUserCountUsingRedis(res.locals.ctx, userId);
        } if (txnFlag === 3) {
            this.logService.info(ctx, `txnFlag=[${txnFlag}] , calling db-tn`)
            serviceResp = await this.userService.updateUserCountUsingDBTxn(res.locals.ctx, userId);
        } else if (txnFlag === 0) {
            this.logService.info(ctx, `txnFlag=[${txnFlag}] , calling direct performCounterUpdate`)
            serviceResp = await this.userService.performCounterUpdate(res.locals.ctx, userId);
        }

        if (serviceResp.hasError) {
            this.logService.info(ctx, `final status for updateUserCount : 400`)
            res.status(400).json({ logId: ctx.logId, data: serviceResp.data });
        } else {
            this.logService.info(ctx, `final status for updateUserCount : 200`)
            res.status(200).json({ logId: ctx.logId, data: serviceResp.data });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        const ctx: Ctx = res.locals.ctx;
        const users = await this.userService.getAllUsers(res.locals.ctx);
        res.status(200).json({ logId: ctx.logId, data: users });
    }
}
