
import express, { NextFunction, Request, Response } from 'express';
const bodyParser = require('body-parser');
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';
const randomId = require('random-id');

// load configs
import { config } from 'dotenv';
import ENV_DIR from './config/envDir';
import { ConsumerGroupManager } from './consumer_grp_manager/consumer.manager';
const path = require('path')
config({ path: path.resolve(__dirname, ENV_DIR) });

// init
const port: string = process.env.APP_PORT || `3034`;



// Middleware to generate a unique request ID for each request
const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ctx: Ctx = {
        logId: randomId(15, 'aA0')
    }
    res.locals.ctx = ctx;
    next();
};

const app = express();
app.use(requestIdMiddleware);
app.use(bodyParser.json());
const consumerGroupManager = new ConsumerGroupManager();
const logService = LogService.getInstance();

app.post('/consumer-groups', async (req: Request, res: Response) => await consumerGroupManager.addConsumerGroups(req, res));
app.get('/consumer-groups', async (req: Request, res: Response) => await consumerGroupManager.getConsumerGroups(req, res));
app.delete('/consumer-groups', async (req: Request, res: Response) => await consumerGroupManager.deleteConsumerGroups(req, res));


app.listen(port, async () => {
    logService.info({} , `server started on port=[${port}] , server-id=[${process.env.SERVER_ID}]`);
});



