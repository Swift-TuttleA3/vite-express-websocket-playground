import express from "express";
import mongoose from "mongoose";
// import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws";
import { SignJWT, jwtVerify } from "jose";
import Canvas from "./models/canvas.js"; // Importieren des Canvas-Schemas

// dotenv.config();

const app = express();
const PORT = 3000;
const SECRET_KEY = new TextEncoder().encode("test_key");
// const PORT = process.env.PORT || 3000;
// const SECRET_KEY = new TextEncoder().encode(
//  process.env.SECRET_KEY || "default_secret_key"
// ); // Geheimnis für JWT

app;

// Startpunkt der Anwendung
app.get("/", (req, res) => {
  res.send("Hallo! Du bist zuhause.");
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/**
 * Configuration options for CORS (Cross-Origin Resource Sharing).
 *
 * @typedef {Object} CorsOptions
 * @property {string} origin - The URL of the frontend application.
 * @property {boolean} credentials - Whether to allow cookies.
 * @property {number} optionsSuccessStatus - The status code to use for successful OPTIONS requests.
 */
/**
 * CORS options for the server.
 * @type {CorsOptions}
 */
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true, // Cookies erlauben
  optionsSuccessStatus: 200, // Einige alte Browser (IE11, verschiedene SmartTVs) akzeptieren 204 nicht als gültigen Statuscode
};

// CORS konfigurieren
app.use(cors(corsOptions));
app.use(express.static("public")); // Statische Dateien im Ordner "public" bereitstellen

const wss = new WebSocketServer({ port: 3131 });
let clickCount = 0;
let userCount = 0; // Zählvariable für die Anzahl der Benutzer

// WebSocket-Verbindung herstellen
wss.on("connection", async function connection(ws, req) {
  console.log("New WebSocket connection established");
  userCount++;
  console.log("Current user count:", userCount);
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({ type: "userCount", count: userCount }));
    }
  });

  const token = await new SignJWT({ user: "placeholder_user_id" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(SECRET_KEY);

  // Setzen des Tokens im Cookie
  ws.send(
    JSON.stringify({
      type: "set-cookie",
      cookie: `token=${token}; HttpOnly; Path=/; Max-Age=7200`,
    })
  );

  // Senden einer Testnachricht beim Verbindungsaufbau
  ws.send(
    JSON.stringify({
      message: "Testnachricht vom Server",
      position: { x: 0, y: 0 },
    })
  );

  // Nachrichten von Client empfangen
  ws.on("message", async function incoming(message) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("Received message from client:", parsedMessage);

      // Validierung der Eingabedaten basierend auf dem Schema
      if (parsedMessage.type === "test") {
        console.log("Test message received:", parsedMessage.content);
      } else if (
        typeof parsedMessage.position_x !== "number" ||
        typeof parsedMessage.position_y !== "number" ||
        typeof parsedMessage.color !== "string" ||
        typeof parsedMessage.edit !== "object" ||
        typeof parsedMessage.edit.time !== "string" ||
        typeof parsedMessage.edit.clickCounter !== "number" ||
        typeof parsedMessage.edit.byUser !== "string"
      ) {
        throw new Error("Invalid message format");
      } else {
        // Authentifizierung
        const { payload } = await jwtVerify(parsedMessage.token, SECRET_KEY);
        if (!payload.user) {
          throw new Error("Invalid token");
        }

        clickCount += 1;
        parsedMessage.edit.clickCounter = clickCount;

        // Speichern des neuen Pixels in der Datenbank (asynchron, ohne auf Antwort zu warten)
        console.log("Saving new pixel data to DB:", parsedMessage);
        Canvas.updateOne(
          { _id: parsedMessage._id },
          { $set: { color: parsedMessage.color, edit: parsedMessage.edit } },
          { upsert: true }
        ).catch((error) => console.error("Error saving to DB:", error));

        // Senden der aktualisierten Daten an alle verbundenen Clients
        console.log(
          "Broadcasting new pixel data to all clients:",
          parsedMessage
        );
        wss.clients.forEach(function each(client) {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        });
      }
    } catch (error) {
      console.error("Error processing message: ", error.message);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  // WebSocket-Verbindung schließen
  ws.on("close", () => {
    userCount--;
    console.log("User disconnected. Current user count:", userCount);
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ type: "userCount", count: userCount }));
      }
    });
  });
});

// MongoDB-Verbindung herstellen
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB: ", err);
});
