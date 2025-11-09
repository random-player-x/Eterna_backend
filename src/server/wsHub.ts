// wsHub.ts
import { WebSocketServer } from "ws";

let wss: WebSocketServer;

export function initWs(server: any) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: any, socket: any, head: any) => {
    if (req.url === "/ws") {                 // <- ADD THIS
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", ws => {
    ws.send("Welcome new client!");
  });
}

export function broadcastUpdate(data: any) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  for (const c of wss.clients) {
    if (c.readyState === 1) c.send(msg);
  }
}
