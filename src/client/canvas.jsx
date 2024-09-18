import { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { ChromePicker } from "react-color";

const Canvas = ({ ws, selectedColor, setSelectedColor, incrementClickCount }) => {
  const [rectangles, setRectangles] = useState([]);
  const [canSetPixel, setCanSetPixel] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSetPixel(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [canSetPixel]);

  const handleCanvasClick = (e) => {
    if (!canSetPixel) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const newRectangle = {
      x: pointerPosition.x,
      y: pointerPosition.y,
      color: selectedColor,
      timestamp: new Date().toLocaleString(),
    };

    setRectangles([...rectangles, newRectangle]);
    setCanSetPixel(false);

    // Senden der Daten an den Server
    const messageData = {
      position: { x: pointerPosition.x, y: pointerPosition.y },
      color: selectedColor,
      timestamp: new Date().toLocaleString(),
    };
    ws.send(JSON.stringify(messageData));
    incrementClickCount();
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
  };

  return (
    <div className="flex">
      <div className="w-1/4 p-1 bg-gray-200">
        <div className="text-center mb-2">
          {canSetPixel ? "You can set a pixel" : "Please wait..."}
        </div>
        <div
          className="w-2 h-2 m-1 cursor-pointer border-l-2"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        {showColorPicker && (
          <ChromePicker color={selectedColor} onChange={handleColorChange} />
        )}
      </div>
      <div className="w-3/4">
        <Stage
          width={window.innerWidth * 0.25}
          height={window.innerHeight * 0.25}
          onClick={handleCanvasClick}
          style={{ border: "5px solid black", cursor: "crosshair" }}
        >
          <Layer>
            {rectangles.map((rect, index) => (
              <Rect
                key={index}
                x={rect.x}
                y={rect.y}
                width={1}
                height={1}
                fill={rect.color}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;