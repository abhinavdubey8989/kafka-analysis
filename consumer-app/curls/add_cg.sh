

# Aim : add a new CG , which listens to the given topics & sleeps "n" seconds after processing each event
# sample-usage : ./<name-of-this-file>.sh



curl --location 'http://localhost:3034/consumer-groups' \
--header 'Content-Type: application/json' \
--data '{
    "newConsumers": [
        {
            "groupId": "cg1",
            "sleepSeconds": 10,
            "topicsToRead": [
                "t3"
            ]
        }
    ]
}'