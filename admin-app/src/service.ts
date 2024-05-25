

import { Ctx } from './utils/ctx';
import { Kafka, Admin, PartitionOffset } from 'kafkajs';
import { LogService } from './utils/logService';
import { StatsDService } from './utils/statsd.service';
const SDC = require('statsd-client');


export interface TopicMap {
    [partition: string]: number;
}

export interface TopicOffsetMap {
    [topic: string]: TopicMap;
}

export interface ConsumerGroupOffsetMap {
    [consumerGroup: string]: TopicOffsetMap;
}

// export interface ConsumerGroupWiseData {
//     state: string;
//     memberCount: number;
//     totalLag: number;
//     topics: any;
// }

// export interface ConsumerGroupWiseLagMap {
//     [consumerGroup: string]: ConsumerGroupWiseData;
// }

export interface TopicWiseLagMap {
    [topic: string]: number;
}


export class Service {

    private kafka: Kafka;
    private logService: LogService;
    private kafkaAdmin: Admin;
    private statsDService: StatsDService;


    constructor() {
        this.logService = LogService.getInstance();
        this.statsDService = StatsDService.getInstance();
        try {
            const brokers = process.env.KAFKA_BROKER_STR!.split(',')
            this.kafka = new Kafka({
                clientId: process.env.APP_NAME,
                brokers
            });
            this.kafkaAdmin = this.kafka.admin();
            this.kafkaAdmin.connect();
        } catch (e) {
            console.log(JSON.stringify(e));
            this.kafka = {} as any;
            this.kafkaAdmin = {} as any;
        }
    }

    public async disconnect(): Promise<void> {
        await this.kafkaAdmin.disconnect();
    }

    async getLagDetails(ctx: Ctx, body: any): Promise<any> {
        this.logService.info(ctx, `called kafka-admin-api`);

        // Get topic offsets
        const topicOffsetMap: TopicOffsetMap = {};
        const topics = await this.kafkaAdmin.listTopics();
        for (const topic of topics) {
            if (topic === '__consumer_offsets') {
                continue;
            }
            const offsets = await this.kafkaAdmin.fetchTopicOffsets(topic);
            topicOffsetMap[topic] = {};
            for (const { partition, offset } of offsets) {
                topicOffsetMap[topic][partition] = +offset;
            }

        }

        // Get consumer group offsets
        const consumerGroupOffsetMap: ConsumerGroupOffsetMap = {};
        const { groups } = await this.kafkaAdmin.listGroups();
        for (const { groupId } of groups) {
            consumerGroupOffsetMap[groupId] = {};
            const groupOffsets = await this.kafkaAdmin.fetchOffsets({ groupId });
            for (const { topic, partitions } of groupOffsets) {
                consumerGroupOffsetMap[groupId][topic] = {};
                for (const { partition, offset } of partitions) {
                    consumerGroupOffsetMap[groupId][topic][partition] = +offset;
                }
            }
        }

        // consumer-group-wise lag
        // @TO-DO : use "ConsumerGroupWiseLagMap" instead of "any"
        const consumerGroupNames = Object.keys(consumerGroupOffsetMap);
        const { groups: groupsDetails } = await this.kafkaAdmin.describeGroups(consumerGroupNames);
        const consumerWiseLag: any = {};
        for (const cg of consumerGroupNames) {
            const grpDetail = groupsDetails.find(x => x.groupId === cg);
            const { members, state } = grpDetail!;
            consumerWiseLag[cg] = { memberCount: members.length, state, topicWiseLag: {}, totalLagForGroup: 0 };

            let totalLagForGroup = 0;
            const topicWiseLag = {} as any
            const topicMapOfThisGroup = consumerGroupOffsetMap[cg];
            const topicsOfThisGroup = Object.keys(topicMapOfThisGroup);
            for (const topic of topicsOfThisGroup) {
                const consumerTopicData = topicMapOfThisGroup[topic];
                const topicData = topicOffsetMap[topic];
                const diff = this.getDiff(topicData, consumerTopicData);
                topicWiseLag[topic] = diff;
                totalLagForGroup += diff;
            }
            consumerWiseLag[cg].totalLagForGroup = totalLagForGroup;
            consumerWiseLag[cg].topicWiseLag = topicWiseLag;
        }

        // topic-wise lag
        const topicNames = Object.keys(topicOffsetMap);
        const topicWiseLagMap: TopicWiseLagMap = {}
        for (const topic of topicNames) {
            let lag = 0;

            for (const cg of consumerGroupNames) {
                const consumerDataForThisTopic = consumerGroupOffsetMap[cg][topic];
                if (!consumerDataForThisTopic) {
                    continue
                }
                lag += this.getDiff(topicOffsetMap[topic], consumerDataForThisTopic);
            }
            topicWiseLagMap[topic] = lag;
        }



        const returnData = {
            topicWiseLagMap,
            consumerWiseLag
        };

        // if send metric is true then only send the metrics
        // we dont want to send metrics when called via postman 
        if (body && body.sendMetric) {
            this.statsDService.sendKafkaMetrics(ctx, returnData);
        }

        return returnData;
    }


    private getDiff(firstArg: TopicMap, secondArg: TopicMap): number {
        let res = 0;
        for (const partition of Object.keys(firstArg)) {
            const a = firstArg[partition];
            const b = (secondArg && secondArg[partition] !== null && secondArg[partition] !== undefined) ? secondArg[partition] : 0;
            res = res + (a - b);
        }
        return res;
    }


    async deleteConsumerGroups(ctx: Ctx, body: any): Promise<any> {
        try {
            const groups = body.listOfConsumerGroupToRemove;
            const groupsToDelete: string[] = [];
            for (const cgName of groups) {
                const offsets = await this.kafkaAdmin.fetchOffsets({ groupId: cgName });
                const {groups} = await this.kafkaAdmin.describeGroups([cgName]);
                for(const g of groups){
                    g
                }

                if (!offsets || !offsets.length) {
                    continue;
                }

                groupsToDelete.push(cgName);

                const topicsOfThisCg = offsets.map(x => x.topic);
                for (const topic of topicsOfThisCg) {
                    const partionCount = offsets.find(x => x.topic === topic)!.partitions.length;
                    const finalPartitionList: PartitionOffset[] = [];
                    for (let i = 0; i < partionCount; i++) {
                        finalPartitionList.push({ offset: `${i}`, partition: -1 })
                    }
                    await this.kafkaAdmin.setOffsets({
                        groupId: cgName,
                        topic,
                        partitions: finalPartitionList
                    });
                }
            }

            if (groupsToDelete.length > 0) {
                await this.kafkaAdmin.deleteGroups(groupsToDelete);
            }
            return groupsToDelete;
        } catch (error) {
            this.logService.error(ctx, JSON.stringify(error))
        }
    };
}