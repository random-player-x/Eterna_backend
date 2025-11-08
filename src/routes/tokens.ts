import { FastifyInstance } from "fastify";

export async function tokensRoute(app: FastifyInstance){
    app.get("/tokens", async (req, reply) =>{
        return[
            {
                token_address: "example",
                token_name: "temp",
                token_ticketer: "TMP",
                price_sol: 0.00001,
            }
        ]
    })
}