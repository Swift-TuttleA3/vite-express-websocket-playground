import { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";

const Canvas = ({ ws, selectedColor, incrementClickCount, rectangles, setRectangles, isConnected, currentUser }) => {
  const [canSetPixel, setCanSetPixel] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSetPixel(true);
    }, 100); // Throttling durch Setzen eines Timers

    return () => clearTimeout(timer);
  }, [canSetPixel]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message received in Canvas:", data); // Logge empfangene Nachrichten
          switch (data.type) {
            case "userCount":
              console.log("User count updated:", data.count);
              break;
            case "initialData":
              console.log("Initial data received:", data.token);
              break;
            default:
              console.log("Received pixel data:", data);
              setRectangles((prevRectangles) => {
                const index = prevRectangles.findIndex(rect => rect._id === data._id);
                if (index !== -1) {
                  const updatedRectangles = [...prevRectangles];
                  updatedRectangles[index] = { ...updatedRectangles[index], color: data.color, edit: data.edit };
                  return updatedRectangles;
                } else {
                  return [...prevRectangles, data];
                }
              });
          }
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
    const colorChange = {
      _id: id,
      position_x: Math.round(pointerPosition.x),
      position_y: Math.round(pointerPosition.y),
      color: selectedColor || "white",
      edit: {
        time: new Date().toISOString(),
        clickCounter: 0,
        byUser: currentUser?.id || "Platzhalter", // Ersetzen Sie currentUser.id durch die tatsächliche Benutzer-ID
      },
    };

    console.log("New rectangle created:", colorChange);

    setRectangles((prevRectangles) => {
      const index = prevRectangles.findIndex(rect => rect._id === id);
      if (index !== -1) {
        const updatedRectangles = [...prevRectangles];
        updatedRectangles[index] = { ...updatedRectangles[index], color: colorChange.color, edit: colorChange.edit };
        return updatedRectangles;
      } else {
        return [...prevRectangles, colorChange];
      }
    });
    setCanSetPixel(false);

    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Sending new rectangle data to server:", colorChange);
      ws.send(JSON.stringify(colorChange));
      incrementClickCount();
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