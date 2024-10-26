import { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";

const Canvas = ({ ws, selectedColor, rectangles, setRectangles, isConnected }) => {
  const [canSetPixel, setCanSetPixel] = useState(true);

useEffect(() => {
  if (ws) {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message received in Canvas:", data); // Logge empfangene Nachrichten

        if (data) {
          console.log("Data exists");
          console.log("Data format:", typeof data);
          console.log("Data:", data);
        } else {
          console.log("Data is empty");
        }

        if (data.error) {
          console.error("Error received from server:", data.error);
          return;
        }

        setRectangles((prevRectangles) => {
          const index = prevRectangles.findIndex(rect => rect._id === data._id);
          if (index !== -1) {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[index] = { ...updatedRectangles[index], color: data.color, timestamp: data.timestamp };
            return updatedRectangles;
          } else {
            return [...prevRectangles, data];
          }
        });
      } catch (error) {
        console.error("Error parsing message from server: ", error);
      }
    };
  }
}, [ws, setRectangles]);

const handleCanvasClick = (e) => {
  if (!canSetPixel || !isConnected) return;

  const stage = e.target.getStage();
  const pointerPosition = stage.getPointerPosition();
  const id = `${Math.round(pointerPosition.x)}_${Math.round(pointerPosition.y)}`;
  const pixelData = {
    _id: id,
    position_x: Math.round(pointerPosition.x),
    position_y: Math.round(pointerPosition.y),
    color: selectedColor || "white",
    timestamp: new Date().toISOString(),
  };

  console.log("New rectangle created:", pixelData);

  setRectangles((prevRectangles) => {
    const index = prevRectangles.findIndex(rect => rect._id === id);
    if (index !== -1) {
      const updatedRectangles = [...prevRectangles];
      updatedRectangles[index] = { ...updatedRectangles[index], color: pixelData.color };
      return updatedRectangles;
    } else {
      return [...prevRectangles, pixelData];
    }
  });
  setCanSetPixel(false);

  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("Sending new rectangle data to server:", pixelData);
    ws.send(JSON.stringify(pixelData));
  } else {
    console.error("WebSocket connection is not open.");
  }
};
  return (
    <div id="canvas">
      <Stage
        width={480}
        height={320}
        onClick={handleCanvasClick}
        style={{ border: "5px solid black", cursor: isConnected ? "crosshair" : "not-allowed" }}
      >
        <Layer>
          {rectangles.map((rect, index) => (
            rect.position && typeof rect.position_x === 'number' && typeof rect.position_y === 'number' ? (
              <Rect
                key={index}
                x={rect.position_x}
                y={rect.position_y}
                width={1}
                height={1}
                fill={rect.color}
              />
            ) : null
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;



/*
state = {
    stageScale: 1,
    stageX: 0,
    stageY: 0
  };
  handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    this.setState({
      stageScale: newScale,
      stageX:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      stageY:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };
*/ 