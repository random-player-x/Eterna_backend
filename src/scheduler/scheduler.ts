import { priceUpdateQueue } from "./queue.js";
import { pollDex } from "../poller.js";

export function startScheduler(){
    priceUpdateQueue.add({}, { repeat: { every: 10000 } });

    priceUpdateQueue.process(async (job) => {
        console.log("Processing job:", job.id);
        await pollDex();
    });
}