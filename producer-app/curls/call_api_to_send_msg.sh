


# Aim : calls an API exposed by producer-app to publish data "n" times to a topic
# sample-usage : ./<name-of-this-file>.sh 7
#               - this will publish data 7 times by calling the API 7 times




TIMES=$1

# defaults to 10 
if [ -z "$TIMES" ] ; then
   TIMES=10
fi


# Iterate using for loop
for (( i=1; i<=$TIMES; i++ )); do
    curl --location "http://localhost:3033/user" \
        --header 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
        --header 'Content-Type: application/json' \
        --data '{
            "id": 1,
            "name": "user-1",
            "count": 1,
            "topic":"t3"
        }'

    echo "called API : $i out of $TIMES"
done