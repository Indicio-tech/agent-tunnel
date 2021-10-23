#!/bin/sh
set -e

TUNNEL_ENDPOINT=${TUNNEL_ENDPOINT:-http://localhost:4040}
WAIT_INTERVAL=${WAIT_INTERVAL:-3}
WAIT_ATTEMPTS=${WAIT_ATTEMPTS:-10}

echo "fetching endpoint from ${TUNNEL_ENDPOINT}" 1>&2
for _ in $(seq 1 "$WAIT_ATTEMPTS"); do
    if ! wget --server-response --spider --quiet "${TUNNEL_ENDPOINT}" 2>&1 | grep "200 OK" > /dev/null; then
        echo "Waiting for tunnel..." 1>&2
        sleep "$WAIT_INTERVAL" &
        wait $!
    else
        break
    fi
done

RETRIEVED=$(wget -qO- "${TUNNEL_ENDPOINT}/url" | sed -nr 's/\{.*"url":\s*"([^"]*)".*}/\1/p')
echo "fetched end point [$RETRIEVED]" 1>&2
echo "$RETRIEVED"
