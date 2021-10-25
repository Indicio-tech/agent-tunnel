#!/bin/sh
set -e

TUNNEL_ENDPOINT=${TUNNEL_ENDPOINT:-http://localhost:4040}
WAIT_INTERVAL=${WAIT_INTERVAL:-3}
WAIT_ATTEMPTS=${WAIT_ATTEMPTS:-10}

echo "fetching endpoint from ${TUNNEL_ENDPOINT}" 1>&2
for _ in $(seq 1 "$WAIT_ATTEMPTS"); do
    if ! curl -s -o /dev/null -w '%{http_code}' "${TUNNEL_ENDPOINT}/url" | grep "200" > /dev/null; then
        echo "Waiting for tunnel..." 1>&2
        sleep "$WAIT_INTERVAL" &
        wait $!
    else
        break
    fi
done

RETRIEVED=$(curl -s "${TUNNEL_ENDPOINT}/url" | sed -nr 's/\{.*"url":\s*"([^"]*)".*}/\1/p')
echo "fetched end point [$RETRIEVED]" 1>&2
echo "$RETRIEVED"

