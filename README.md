


# Aim
The aim of this project is to create a system (an app or adhoc scripts) to monitor kafka.
The monitoring is for 
- kafka topic-wise lag 
- kafka consumer-wise lag
- consumer group state (active or inactive)
- consumer group members


# Approach

[producer-app] ==> [Kafka cluster] ==> [consumers]
                        ^
                        |
                        |
                [monitoring app/scripts]


The monitoring app or scripts will scrape data from kafka cluster
- in nodejs we can use kafkajs admin api
- we can also use shell scipt to extract data using `kafka-consumer-groups` script of kafka


# How to
- start all kafka dependencies by running :  `start_or_stop.sh` inside `dependencies` dir
- optionally start the monitoring dependencies : statsd , graphite , grafana
- start the producer-app , consumer-app , admin-app


- The producer-app
    - exposes an API which also takes the topic name to publish the data to

- The consumer-app
    - just logs the data 
    - exposes 3 APIs to get all consumer-groups
    - add a new consumer-grp
    - delete a consumer-grp
    - these consumer-grps are kept inside a map itself (not in DB)

- The admin-app 
    - exposes an endpoint `/kafka-admin`
    - which can be scraped periodically or can be called periodically to send data to graphite via statsd & then visualised in grafana 



# NOTE : 
- the `scripts` dir is not used (as of now)


# Below are kafka CLI commands (to be run inside container)

# exec as root user into kafka container
- docker exec -u root -it my_kafka_1 /bin/bash

# list topic
- /bin/kafka-topics --list --bootstrap-server localhost:9092

# describe a topic
- /bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic <>
- /bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic "t3"

# create a topic
- /bin/kafka-topics --create --bootstrap-server localhost:9092 --topic <> --partitions <> --replication-factor <>
- /bin/kafka-topics --create --bootstrap-server localhost:9092 --topic "t3" --partitions 3 --replication-factor 3

# delete a topic
- /bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic <> --if-exists
- /bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic "t3" --if-exists


# list all consumer groups
- /bin/kafka-consumer-groups --bootstrap-server localhost:9092 --list

# describe all consumer groups
- /bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups

# describe a consumer group
- /bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group "cg1"

# delete a consumer group
- /bin/kafka-consumer-groups --bootstrap-server localhost:9092 --delete --group "cg1"

# get consumer group state (stable/empty)
- /bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups --state


# Zookpeer ui
- link : http://localhost:9000
- connection-string : host.docker.internal:2181 (this port is host-machine port)
- Auth-username & Auth-password can be anything

# Kafka ui 
- link : http://localhost:9100/ui/clusters/create-new-cluster
- host string : my_kafka_1 (or my_kafka_2 or my_kafka_3)
- port : 9092 (or 9094 or 9096)
