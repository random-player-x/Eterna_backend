import { searchTokens, getTokenDetails } from "./sources/dexscreener.js";
import { setTokens } from "./state.js";

export async function pollDex() {
  // fetch list of tokens matching "dog"
  const search = await searchTokens("dog");

  const addresses = (search?.pairs || [])
    .map((p: any) => p.baseToken?.address)
    .filter(Boolean)
    .slice(0, 20); // limit 20 for safety

  // get details for each
  const details = [];
  for (const a of addresses) {
    const d = await getTokenDetails(a);
    details.push(d);
  }

  // store them in memory
  setTokens(details);
}
