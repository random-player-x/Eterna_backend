# Eterna_backend
## meme-aggregator
### Description

Backend aggregates meme coins from DexScreener + Jupiter and pushes live price updates via websocket. <br>
Latest Tokens are fetched from dex screener api: https://api.dexscreener.com/token-boosts/latest/v1 and then the addresses are extracted from these, now these are fed to the jupiter price api which requires token address to give the price and other details of that token. <br>
Both the DEXs are then combined by taking the mean of the prices and creating a new object which is returned. <br>
After that once /tokens is hit. the next set of data is automatically updated using Poller - and scheduling, and that information is relayed using websockets. <br>
Caching is done using redis - it was manual before that, and the cache stores the data so that /token does not need to be hit by the client again and again. And the updated data is displayed using websockets.




### Architecture Overview
#### Component	Responsibility
poller.ts -> periodically fetches fresh data from DexScreener + Jupiter
merge.ts -> merges multi-source token data + computes final USD price
cache.ts -> Redis caching layer (prevents API spam + handles TTL)
state.ts -> holds latest snapshot in memory
tokensRoute.ts -> REST API endpoint for initial token snapshot
wsHub.ts -> WebSocket server for realtime push updates
scheduler.ts -> Bull queue job scheduling (runs poller every 10s)
Data Flow -> (exact same as axiom.trade discover)

on backend start → scheduler -> registers -> Bull repeat job

bull queue triggers poll job every 10 seconds

### poller:

1. discovers addresses via DexScreener search

2. fetches detailed token data per address from DexScreener

3. fetches SOL/USD + token/USD via Jupiter

4. sends arrays into merge function

5. merged result stored → memory + redis cache

6. WebSocket broadcasts type: "update" event to all connected tabs

7. Frontend listens → UI updates without HTTP calls

### Caching Strategy
#### type	reason
Redis (tokens key)	avoid DexScreener / Jupiter rate limits
TTL = 30s	required freshness + prevents API ban

REST /tokens always returns data from cache if available → 0 external API calls.

Rate Limiting / Resilience

All external fetch operations are behind:

centralized poller (only 1 per backend)

Redis cache, so UI can spam /tokens without hitting DEXs

Bull queue job scheduling → no overlapping runs

(Exponential backoff is applied internally to retry transient failures.)

Endpoints
Endpoint	Description
## GET /tokens	returns paginated + filtered + sorted tokens
period	1h or 24h via ?period=1h
sort	?sort=priceChange&order=asc
filter	?minPriceChange24h=0&minVolume24h=10000
pagination	?limit=10&cursor=10

## Example:

### GET /tokens?period=1h&sort=priceChange&order=desc&minVolume24h=20000&limit=10&cursor=0

WebSocket (Realtime)

All clients connect to (ws://localhost:8080) and receive broadcast messages:

{
  "type":"update",
  "tokens":[ ... ]
}


Frontend never polls HTTP for updates again.

## Running Locally
npm install
redis-server
npm run dev


Server starts on:

http://localhost:8080

Deliverables Status (Check List)
Requirement	Status
Aggregation from 2 real DEX APIs	✅ DexScreener + Jupiter
Merge duplicates + compute USD price	✅
Caching (TTL 30s)	✅ Redis
Real-time WebSocket updates	✅
Filtering + sorting	✅
Cursor pagination	✅
Task scheduling	✅ Bull queue
No heavy blockchain logic	✅
Notes

<!-- poller has ONLY ONE execution per interval (BullMQ handles it),
frontend may hit /tokens unlimited times — system stays stable. -->
