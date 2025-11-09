import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function getLatestTokens() {
  const url = `https://api.dexscreener.com/token-boosts/latest/v1
  `;
  const res = await axios.get(url, { httpsAgent });
  return res.data;
}

export async function getTokenDetails(address: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
  const res = await axios.get(url, { httpsAgent });
  return res.data;
}
