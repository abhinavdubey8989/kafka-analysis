
# Aim : send msg to kafka cluster via producer-app , 1 msg ever 'x' seconds
# sample-usage : ./<name-of-this-file>.sh


main(){

    # go-to dir
    BASE_DIR=$PWD 
    PRODUCER_APP_DIR=$BASE_DIR/producer-app/curls
    cd $PRODUCER_APP_DIR

    
    # run script which calls prodcuer API forever
    while true; do
        ./call_api_to_send_msg.sh 1
        sleep 5
    done
}


# call main method
main
