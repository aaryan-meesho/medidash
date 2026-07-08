#!/bin/sh
set -e

node backend/src/server.js &
BACKEND_PID=$!

node serve-static.js &
STATIC_PID=$!

wait $BACKEND_PID $STATIC_PID
