import mongoose from "mongoose";

const canvasSchema = new mongoose.Schema({
  _id: String,
  position_x: Number,
  position_y: Number,
  color: String,
  edit: {
    time: String,
    clickCounter: Number,
    byUser: String, // Platzhalter->Referenz zur User-Collection siehe unten
  },
});

const Canvas = mongoose.model("Canvas", canvasSchema);

export default Canvas;

//   userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referenz zur User-Collection
