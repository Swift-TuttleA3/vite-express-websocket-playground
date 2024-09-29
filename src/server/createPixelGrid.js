// KLeine Routine, um ein 480x320 Pixel großes Raster in der
// MongoDB - Datenbank zu erstellen. Jedes Pixel wird als Dokument
// in der Sammlung "canvas" gespeichert. Das Raster wird mit
// einem Standardfarbwert von "#FFFFFF" initialisiert.
// !!!!! Wichtig: die Referenz für den User in zeile 39 muss noch angepasst werden!!!!
// !!!!! Referenz zur User-Collection !!!!!

import mongoose from "mongoose";

async function createPixelGrid() {
  const mongoURI =
    "mongodb+srv://rpanek888:conradzuse007@pixels.nqr3x.mongodb.net/test?retryWrites=true&w=majority&appName=Pixels"; // Datenbankname "test" in der URI
  try {
    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB...Creating pixel grid database");

    const database = mongoose.connection.db;
    const collection = database.collection("canvas");

    await collection.deleteMany({});

    const documents = [];
    const defaultColor = "#FFFFFF";
    const currentTime = new Date().toISOString(); // Einheitlicher Zeitstempel

    for (let x = 1; x < 480; x++) {
      for (let y = 1; y < 320; y++) {
        const document = {
          _id: `${x}_${y}`,
          position_x: x,
          position_y: y,
          farbe: defaultColor,
          lastEdit: {
            time: currentTime,
            clickCounter: 0,
            byUser: "Platzhalter", // Platzhalter, kann später aktualisiert werden
          },
        };
        documents.push(document);
      }
    }

    const result = await collection.insertMany(documents);
    console.log(`${result.insertedCount} Dokumente erfolgreich eingefügt`);
  } catch (error) {
    console.error("Fehler beim Einfügen der Dokumente:", error);
  } finally {
    mongoose.connection.close();
  }
}

createPixelGrid();
// byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Platzhalter, kann später aktualisiert werden
