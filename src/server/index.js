import express from "express";
import { Router } from "express";
import { WebSocketServer } from "ws";

const app = express();
const router = Router();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hallo! Du bist zuhause.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ port: 3131 });
let clickCount = 0;

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("Server received message: %s", message);
    const parsedMessage = JSON.parse(message);
    clickCount += 1;
    parsedMessage.clickCount = clickCount;

    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  ws.send(
    JSON.stringify({
      message: "Testnachricht vom Server",
      position: { x: 0, y: 0 },
    })
  );
});

wss.on("listening", () => {
  console.log(
    "WebSocketServer is running on Port ws://localhost:" + wss.address().port
  );
});

wss.on("error", (error) => {
  console.log("WebSocketServer error: ", error);
});

wss.on("close", () => {
  console.log("WebSocketServer closed");
});
