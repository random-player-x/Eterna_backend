import axios from "axios";


export async function searchTokens(query: string){
    const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    return res.data;
}

export async function getTokenDetails(address: string){
    const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
    const res = await axios.get(url);
    return res.data;
}