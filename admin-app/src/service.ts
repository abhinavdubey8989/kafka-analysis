

import { Ctx } from './utils/ctx';
import os from 'os';
import { Kafka, Consumer, Admin } from 'kafkajs';
import { LogService } from './utils/logService';


export interface TopicMap {
    [partition: string]: number;
}

export interface TopicOffsetMap {
    [topic: string]: TopicMap;
}

export interface ConsumerGroupOffsetMap {
    [consumerGroup: string]: TopicOffsetMap;
}

export interface ConsumerGroupWiseLagMap {
    [consumerGroup: string]: { [topic: string]: number };
}

export interface TopicWiseLagMap {
    [topic: string]: number;
}


export class Service {

    private kafka: Kafka;
    private logService: LogService;
    private kafkaAdmin: Admin;


    constructor() {
        this.logService = LogService.getInstance();
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

    async getLagDetails(ctx: Ctx): Promise<any> {

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
        const consumerGroupNames = Object.keys(consumerGroupOffsetMap);
        const consumerWiseLag: ConsumerGroupWiseLagMap = {}
        for (const cg of consumerGroupNames) {
            consumerWiseLag[cg] = {}
            const topicMapOfThisGroup = consumerGroupOffsetMap[cg];
            const topicsOfThisGroup = Object.keys(topicMapOfThisGroup);
            for (const topic of topicsOfThisGroup) {
                const consumerTopicData = topicMapOfThisGroup[topic];
                const topicData = topicOffsetMap[topic];
                const diff = this.getDiff(topicData, consumerTopicData);
                consumerWiseLag[cg][topic] = diff
            }
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



        return {
            // topicOffsetMap,
            // consumerGroupOffsetMap,
            consumerWiseLag,
            topicWiseLagMap
        };
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
}