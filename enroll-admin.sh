#!/bin/bash

PORT=3001


PID=$(lsof -t -i:$PORT)
if [ ! -z "$PID" ]; then
    echo "Killing process on port $PORT"
    kill -9 $PID
    sleep 2
fi


cd fabric-samples/backend/application-javascript


npm run dev &
APP_PID=$!  

sleep 5

# Enroll the admin and create the wallet
RESPONSE=$(curl -s -o response.txt -w "%{http_code}" -X GET http://localhost:3001/enrollAdmin)

if [ "$RESPONSE" -eq 200 ]; then
    sleep 5

    if [ -d wallet ]; then
        mv wallet ../backend-service/network

        echo "Admin enrolled and wallet moved successfully."
    else
        echo "Wallet directory not found."
    fi
else
    echo "Failed to enroll admin. HTTP status: $RESPONSE"
fi


kill $APP_PID

rm -f response.txt
cd ../../..
