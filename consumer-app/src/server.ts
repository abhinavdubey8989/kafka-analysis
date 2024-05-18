
import express from 'express';
import { LogService } from './utils/logService';

// load configs
import { config } from 'dotenv';
import ENV_DIR from './config/envDir';
import { Consumer1 } from './consumer_grp_1/consumer';
import { Consumer2 } from './consumer_grp_2/consumer';
const path = require('path')
config({ path: path.resolve(__dirname, ENV_DIR) });


// init
const port: string = process.env.APP_PORT || `3034`;

const app = express();
new Consumer1();
new Consumer2();

const logService = LogService.getInstance();

app.listen(port, async () => {
    logService.info({} , `server started on port=[${port}] , server-id=[${process.env.SERVER_ID}]`);
});



