import { FastifyInstance } from "fastify";
import { getAllTokens } from "../state.js";
import { getCache } from "../cache.js";

export async function tokensRoute(app: FastifyInstance){
    app.get("/tokens", async (req, reply) =>{

        const cached = getCache("tokens");
        let tokens = cached || getAllTokens();
        let period = (req.query as any).period || "24h";
        let priceChangeKey = `priceChange${period}`;

        const {sort, order} = req.query as any;
        if (sort) {
            tokens = [...tokens].sort((a, b) => {
              const av = sort === "priceChange" ? a[priceChangeKey] ?? 0 : a[sort] ?? 0;
              const bv = sort === "priceChange" ? b[priceChangeKey] ?? 0 : b[sort] ?? 0;

              if (order === "asc") return av - bv;
              return bv - av;
            });
          }

          const {minVolume24h, minLiquidityUsd, minPrice, name, symbol} = req.query as any;
          
            if (name) {
                tokens = tokens.filter(t => t.name?.toLowerCase().includes(name.toLowerCase()) || t.symbol?.toLowerCase().includes(name.toLowerCase()));
            }
            if (minVolume24h) {
                tokens = tokens.filter(t => (t.volume24h ?? 0) >= Number(minVolume24h));
            }
            if (minLiquidityUsd) {
                tokens = tokens.filter(t => (t.liquidityUsd ?? 0) >= Number(minLiquidityUsd));
            }
            if (minPrice) {
                tokens = tokens.filter(t => (t.price ?? 0) >= Number(minPrice));
            }
            if (symbol) {
                tokens = tokens.filter(t => t.symbol?.toLowerCase() === symbol.toLowerCase());
            }
      
          return tokens;
    });
}