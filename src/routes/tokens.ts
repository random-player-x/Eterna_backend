import { FastifyInstance } from "fastify";
import { getAllTokens } from "../state.js";


export async function tokensRoute(app: FastifyInstance){
    app.get("/tokens", async (req, reply) =>{

        const tokens = getAllTokens();
        return tokens;
    })
}