import express from "express";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key"; // Geheimnis für JWT

app.use(express.static("public")); // Statische Dateien im Ordner "public" bereitstellen

app.get("/", (req, res) => {
  res.send("Hallo! Du bist zuhause.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ port: 3131 });
let clickCount = 0;

wss.on("connection", function connection(ws) {
  // Generieren eines JWT beim Verbindungsaufbau
  const token = jwt.sign({ user: "user" }, SECRET_KEY, { expiresIn: "2h" });

  ws.on("message", async function incoming(message) {
    try {
      const parsedMessage = JSON.parse(message);

      // Validierung der Eingabedaten
      if (
        !parsedMessage.position ||
        typeof parsedMessage.position.x !== "number" ||
        typeof parsedMessage.position.y !== "number" ||
        !parsedMessage.color ||
        typeof parsedMessage.color !== "string" ||
        !parsedMessage.timestamp ||
        typeof parsedMessage.timestamp !== "string"
      ) {
        throw new Error("Invalid message format");
      }

      // Authentifizierung
      const payload = jwt.verify(token, SECRET_KEY);
      if (!payload.user) {
        throw new Error("Unauthorized");
      }

      clickCount += 1;
      parsedMessage.clickCount = clickCount;

      wss.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error("Error processing message: ", error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.send(
    JSON.stringify({
      message: "Testnachricht vom Server",
      position: { x: 0, y: 0 },
      token: token, // Senden des JWT an den Client
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
