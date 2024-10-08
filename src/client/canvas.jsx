import { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { SignJWT } from "jose";

const SECRET_KEY = "test_key";                                                           // Geheimnis !!! AN ENVIRONMENT VARIABLEN DENKEN !!!

const Canvas = ({ ws, selectedColor, setSelectedColor, incrementClickCount }) => {
  const [rectangles, setRectangles] = useState([]);
  const [canSetPixel, setCanSetPixel] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSetPixel(true);
    }, 100);                                                                                // Timer !!!

    return () => clearTimeout(timer);
  }, [canSetPixel]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.position && data.color) {
            setRectangles((prevRectangles) => [...prevRectangles, data]);
          }
        } catch (error) {
          console.error("Error parsing message from server: ", error);
        }
      };
    }
  }, [ws]);

  const handleCanvasClick = async (e) => {
    if (!canSetPixel) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const newRectangle = {
      position: {
        x: Math.round(pointerPosition.x),
        y: Math.round(pointerPosition.y),
      },
      color: selectedColor,
      timestamp: new Date().toLocaleString(),
    };

    // Einfache Authentifizierung
    const token = await new SignJWT({ user: "user" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(new TextEncoder().encode(SECRET_KEY));

    newRectangle.token = token;

    setRectangles([...rectangles, newRectangle]);
    setCanSetPixel(false);

    // Überprüfen, ob die WebSocket-Verbindung vorhanden ist
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(newRectangle));
      incrementClickCount();
    } else {
      console.error("WebSocket connection is not open.");
    }
  };

  return (
    <div>
      <Stage
        width={500}
        height={500}
        onClick={handleCanvasClick}
        style={{ border: "5px solid black", cursor: "crosshair" }}
      >
        <Layer>
          {rectangles.map((rect, index) => (
            <Rect
              key={index}
              x={rect.position.x}
              y={rect.position.y}
              width={1}
              height={1}
              fill={rect.color}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;