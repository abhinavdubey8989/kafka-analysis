
import express, { NextFunction, Request, Response } from 'express';
const bodyParser = require('body-parser');
import { UserController } from './controller';
import { LogService } from './utils/logService';
import { Ctx } from './utils/ctx';
const randomId = require('random-id');

// load configs
import { config } from 'dotenv';
import ENV_DIR from './config/envDir';
const path = require('path')
config({ path: path.resolve(__dirname, ENV_DIR) });


// init
const port: string = process.env.APP_PORT || `3033`;

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
const userController = new UserController();
const logService = LogService.getInstance();

app.post('/user', async (req: Request, res: Response) => await userController.addUser(req, res));
app.put('/user/:userId', async (req: Request, res: Response) => await userController.updateUser(req, res));
app.get('/users', async (req: Request, res: Response) => await userController.getAllUsers(req, res));
app.put('/incr-count-user/:userId/:txnFlag', async (req: Request, res: Response) => await userController.updateUserCount(req, res));


app.listen(port, async () => {
    logService.info({} , `server started on port=[${port}] , server-id=[${process.env.SERVER_ID}]`);
});



