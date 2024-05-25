import { Ctx } from "./ctx";
import { LogService } from "./logService";
const SDC = require('statsd-client');


export class StatsDService {

    private static instance: StatsDService;
    private statsdClient: any;
    private logService: LogService;

    private constructor() {
        this.logService = LogService.getInstance();
        this.statsdClient = new SDC({
            host: process.env.STATSD_HOST,
            port: process.env.STATSD_PORT
        });
    }

    public static getInstance() {
        if (!StatsDService.instance) {
            StatsDService.instance = new StatsDService();
        }
        return StatsDService.instance;
    }

    updateCounter(ctx: Ctx, metric: string, counter: number = 1): void {
        // this.logService.info(ctx, `updateCounter : [${metric}] by [${counter}] ...`);
        this.statsdClient.increment(metric, counter);
    }

    sendKafkaMetrics(ctx: Ctx, data: any): void {
        const { topicWiseLagMap, consumerWiseLag } = data;

        // topic-wise
        for (const topic of Object.keys(topicWiseLagMap)) {
            const metric = `kafka.${topic}.lag`;
            const lag = topicWiseLagMap[topic];
            this.updateCounter(ctx, metric, lag);
        }

        // CG-wise
        for (const cg of Object.keys(consumerWiseLag)) {
            for (const topic of Object.keys(consumerWiseLag[cg].topicWiseLag)) {
                const metric = `kafka.${cg}.${topic}.${consumerWiseLag[cg].state}.lag`;
                const lag = consumerWiseLag[cg].topicWiseLag[topic];
                this.updateCounter(ctx, metric, lag);
            }
        }
    }
}