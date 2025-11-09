import WebSocket from "ws";

const ws = new WebSocket("ws://127.0.0.1:8080/ws");

ws.on("open", ()=>console.log("open"));
ws.on("message", (d)=>console.log("msg:", d.toString()));
ws.on("error", console.error);
