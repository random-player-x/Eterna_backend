// src/sources/jupiter.ts
import axios from "axios";

export async function getJupiterPrices(addresses: string[]) {
  if (addresses.length === 0) return {};

  const ids = addresses.join(",");
  const url = `https://lite-api.jup.ag/price/v3?ids=${encodeURIComponent(ids)}`;
  const res = await axios.get(url);
  return res.data;
}
