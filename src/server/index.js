import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import Canvas from "./models/canvas.js"; // Importieren des Canvas-Schemas

dotenv.config();

// Überprüfen Sie, ob die Umgebungsvariablen korrekt geladen werden
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("SECRET_KEY:", process.env.SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key"; // Geheimnis für JWT

// CORS-Anfragen vom Frontend erlauben
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true, // Cookies erlauben
  optionsSuccessStatus: 200, // Einige alte Browser (IE11, verschiedene SmartTVs) akzeptieren 204 nicht als gültigen Statuscode
};

app.use(cors(corsOptions));
app.use(express.static("public")); // Statische Dateien im Ordner "public" bereitstellen

const wss = new WebSocketServer({ port: 3131 });
let clickCount = 0;
let userCount = 0; // Zählvariable für die Anzahl der Benutzer

wss.on("connection", async function connection(ws) {
  console.log("New WebSocket connection established");
  userCount++;
  console.log("Current user count:", userCount);
  wss.clients.forEach(function each(client) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({ type: "userCount", count: userCount }));
    }
  });

  const token = jwt.sign({ user: "placeholder_user_id" }, SECRET_KEY, {
    expiresIn: "2h",
  });

  ws.on("message", async function incoming(message) {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("Received message from client:", parsedMessage);

      // Validierung der Eingabedaten basierend auf dem Schema
      if (
        typeof parsedMessage.position_x !== "number" ||
        typeof parsedMessage.position_y !== "number" ||
        typeof parsedMessage.color !== "string" ||
        typeof parsedMessage.edit !== "object" ||
        typeof parsedMessage.edit.time !== "string" ||
        typeof parsedMessage.edit.clickCounter !== "number" ||
        typeof parsedMessage.edit.byUser !== "string"
      ) {
        throw new Error("Invalid message format");
      }

      // Authentifizierung
      const payload = jwt.verify(token, SECRET_KEY);
      if (!payload.user) {
        throw new Error("Unauthorized");
      }

      clickCount += 1;
      parsedMessage.edit.clickCounter = clickCount;

      // Speichern des neuen Pixels in der Datenbank
      console.log("Saving new pixel data to DB:", parsedMessage);
      await Canvas.updateOne(
        { _id: parsedMessage._id },
        { $set: { color: parsedMessage.color, edit: parsedMessage.edit } },
        { upsert: true }
      );

      // Senden der aktualisierten Daten an alle verbundenen Clients
      console.log("Broadcasting new pixel data to all clients:", parsedMessage);
      wss.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error("Error processing message: ", error.message);
    }
  });
  ws.on("close", () => {
    userCount--;
    console.log("User disconnected. Current user count:", userCount);
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ type: "userCount", count: userCount }));
      }
    });
  });

  ws.send(
    JSON.stringify({
      type: "initialData",
      token: token,
    })
  );
});

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
