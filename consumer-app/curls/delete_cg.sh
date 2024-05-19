



# Aim : delete a CG 
# sample-usage : ./<name-of-this-file>.sh


curl --location --request DELETE 'http://localhost:3034/consumer-groups' \
--header 'Content-Type: application/json' \
--data '{
    "newConsumers": [
        {
            "groupId": "cg1"
        }
    ]
}'