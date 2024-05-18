

# list tpc
/bin/kafka-topics --list --bootstrap-server localhost:9092

# descibe tpc
/bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic <>
/bin/kafka-topics --describe --bootstrap-server localhost:9092 --topic "t3"

# create tpc
/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic <> --partitions <> --replication-factor <>
/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic "t1" --partitions 1 --replication-factor 1
/bin/kafka-topics --create --bootstrap-server localhost:9092 --topic "t3" --partitions 3 --replication-factor 3


# delete tpc
/bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic <> --if-exists
/bin/kafka-topics --bootstrap-server localhost:9092 --delete --topic "t1" --if-exists


# list cnsmr grps
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --list


# list consumer groups
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups

# delete consumer group
/bin/kafka-consumer-groups --bootstrap-server localhost:9092 --delete --group "cnsmr_gp_1"

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