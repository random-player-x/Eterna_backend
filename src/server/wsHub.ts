import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export function initWs(server: any){
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("New client connected");
        ws.send("Welcome new client!");
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
}

export function broadcastUpdate(data: any){
    if(!wss) return;
    const message = JSON.stringify(data);

    wss.clients.forEach((client) => {
        if(client.readyState === 1){
            client.send(message);
        }
    });
}