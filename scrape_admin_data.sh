
# Aim : scrape /kafka-admin endpoint , which internally sends data to graphite
# sample-usage : ./<name-of-this-file>.sh


main(){

    # call API forever
    while true; do

        # this curl will put response of api on console
        # curl --location 'http://localhost:3035/kafka-admin'

        # this curl will NOT put response of api on console
        # "-s" : stand for silent mode
        # "-o /dev/null" :  specifies the output file , which here is null
        curl -s -o /dev/null --location 'http://localhost:3035/kafka-admin' \
        --header 'Content-Type: application/json' \
        --data '{
            "sendMetric": true
        }'

        # this should be same as statsd flush-interval , if its smaller the metric-numbers will add up
        sleep 10

    done
}


# call main method
main
