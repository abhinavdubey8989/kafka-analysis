

# list topic
/bin/kafka-topics --list --bootstrap-server localhost:9092

# descibe topic
/bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic <>
/bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic "t3"

# create topic
/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic <> --partitions <> --replication-factor <>
/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic "t3" --partitions 3 --replication-factor 3


# delete topic
/bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic <> --if-exists
/bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic "t3" --if-exists


# list all consumer groups
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --list

# describe all consumer groups
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups

# describe 1 consumer group
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group "cg1"

# delete consumer group
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --delete --group "cg1"

# get consumer group state (stable/empty)
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups --state

# exec as root user into kafka container
docker exec -u root -it my_kafka_1 /bin/bash



KafkaJSConnectionError: Connection error: read ECONNRESET","groupId":"cnsmr_gp_1","stack":"KafkaJSConnectionError: 
Connection error: read ECONNRESET 
at Socket.onError (/Users/abhinav.dubey/Documents/ad/kafka/consumer-app/node_modules/kafkajs/src/network/connection.js:210:23)   
at Socket.emit (node:events:514:28)
at Socket.emit (node:domain:488:12)
at emitErrorNT (node:internal/streams/destroy:151:8) 
at emitErrorCloseNT (node:internal/streams/destroy:116:3)  
at processTicksAndRejections (node:internal/process/task_queues:82:21)


Crash: KafkaJSConnectionError: Connection error: getaddrinfo ENOTFOUND "my_kafka_1","groupId":"cnsmr_gp_1","stack":"KafkaJSConnectionError: Connection error: getaddrinfo ENOTFOUND my_kafka_1 
at Socket.onError (/Users/abhinav.dubey/Documents/ad/kafka/consumer-app/node_modules/kafkajs/src/network/connection.js:210:23)
at Socket.emit (node:events:514:28)   
at Socket.emit (node:domain:488:12)
at emitErrorNT (node:internal/streams/destroy:151:8)   
at emitErrorCloseNT (node:internal/streams/destroy:116:3) 
at processTicksAndRejections (node:internal/process/task_queues:82:21)