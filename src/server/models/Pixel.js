import mongoose from "mongoose";

const pixelSchema = new mongoose.Schema({
  position_x: Number,
  position_y: Number,
  color: String,
});

const Pixel = mongoose.model("Pixel", pixelSchema);

export default Pixel;
