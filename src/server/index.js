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

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("Server received message: %s", message);
    const parsedMessage = JSON.parse(message);
    // Nachricht diesmal an ALLE verbundenen Clients senden
    // WICHTIG: ws.clients ist ein Set, kein Array !!!
    // TO-DO: MIT MEHREREN CLIENTS TESTEN
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

/* Variante ohne Mausposition
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

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("Server received message: %s", message);
    // Antwort an den Client senden
    ws.send(`Server received: ${message}`);
  });

  ws.send("Testnachricht vom Server");
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

// Benutze Postman oder curl um eine Nachricht an den Server zu senden. Z.Bsp.:
// curl -X POST http://localhost:3000 -d "Hallo Server"
// oder
// curl -X POST http://localhost:3000 -d "Hallo Server" -H "Content-Type: text/plain"
*/
