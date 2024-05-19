
# Aim : the aim of this script is to clear the docker-container volumn data
# sample-usage : ./<name-of-this-file>.sh


# zookeeper
rm -rf dependencies/volumns/zookeeper/*


# kafka
rm -rf dependencies/volumns/kafka-*/*


touch dependencies/volumns/kafka-1/stats.txt
