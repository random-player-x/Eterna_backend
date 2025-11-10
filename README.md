# Eterna_backend
## Meme-aggregator
### Description

Backend aggregates meme coins from DexScreener + Jupiter and pushes live price updates via websocket. <br>
Latest Tokens are fetched from dex screener api: https://api.dexscreener.com/token-boosts/latest/v1 and then the addresses are extracted from these, now these are fed to the jupiter price api which requires token address to give the price and other details of that token. <br>
Both the DEXs are then combined by taking the mean of the prices and creating a new object which is returned. <br>
After that once /tokens is hit. the next set of data is automatically updated using Poller - and scheduling, and that information is relayed using websockets. <br>
Caching is done using redis - it was manual before that, and the cache stores the data so that /token does not need to be hit by the client again and again. And the updated data is displayed using websockets.


### Architecture Overview
#### Component	Responsibility

poller.ts -> periodically fetches fresh data from DexScreener + Jupiter <br>
merge.ts -> merges multi-source token data + computes final USD price <br>
cache.ts -> Redis caching layer (prevents API spam + handles TTL) <br>
state.ts -> holds latest snapshot in memory <br>
tokensRoute.ts -> REST API endpoint for initial token snapshot <br>
wsHub.ts -> WebSocket server for realtime push updates <br>
scheduler.ts -> Bull queue job scheduling (runs poller every 10s) <br>
Data Flow -> (exact same as axiom.trade discover) <br>
on backend start → scheduler -> registers -> Bull repeat job <br>
bull queue triggers poll job every 10 seconds <br>

## Poller:

1. Discovers addresses via DexScreener search <br>
2. Fetches detailed token data per address from DexScreener <br>
3. Fetches SOL/USD + token/USD via Jupiter <br>
4. Sends arrays into merge function <br>
5. Merged result stored → memory + redis cache <br>
6. WebSocket broadcasts type: "update" event to all connected tabs <br>
7. Frontend listens → UI updates without HTTP calls <br>

## Caching Strategy

### Redis Tokens Cache
1. Uses Redis with token symbol as key
2. TTL = 30 seconds → keeps data fresh AND prevents hitting API rate limits
3. /tokens REST endpoint always returns from Redis if present
4. Result: 0 external DEX API calls during UI spam
   
### Rate Limiting + Resilience Design

1. All external price fetches run through a single centralized poller (1 instance per backend)
2. UI can call /tokens rapidly → no direct DEX hits
3. Bull queue schedules the polling job → no overlapping runs
4. Exponential backoff on transient failures → retry without hammering APIs

## Endpoints

### GET /tokens	returns paginated + filtered + sorted tokens
Period -> 1h or 24h via ?period=1h <br>
Sort -> ?sort=priceChange&order=asc <br>
Filter -> ?minPriceChange24h=0&minVolume24h=10000 <br>
Pagination -> ?limit=10&cursor=10 <br>

## Example:
#### GET /tokens?period=1h&sort=priceChange&order=desc&minVolume24h=20000&limit=10&cursor=0

WebSocket (Realtime)

### All clients connect to (ws://localhost:8080) and receive broadcast messages:

{
  "type":"update",
  "tokens":[ ... ]
}

Frontend never polls HTTP for updates again.

## Running Locally
npm install <br>
redis-server <br>
npm run dev <br>


Server starts on:

http://localhost:8080

## Deliverables Status (Check List) <br>

Aggregation from 2 real DEX APIs	✅ DexScreener + Jupiter <br>
Merge duplicates + compute USD price	✅ <br>
Caching (TTL 30s)	✅ Redis <br>
Real-time WebSocket updates	✅ <br>
Filtering + sorting	✅ <br>
Cursor pagination	✅ <br>
Task scheduling	✅ Bull queue <br>
No heavy blockchain logic	✅ <br>

<!-- poller has ONLY ONE execution per interval (BullMQ handles it),
frontend may hit /tokens unlimited times — system stays stable. -->
