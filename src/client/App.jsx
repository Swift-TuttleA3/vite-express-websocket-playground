import { useState, useEffect } from "react";
import WebSocketComponent from "./WebSocketComponent";
import Canvas from "./canvas";
import ColorPicker from "./ColorPicker";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [selectedColor, setSelectedColor] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState("");
  const [rectangles, setRectangles] = useState([]);

  const incrementClickCount = () => {
    setClickCount(clickCount + 1);
  };

  useEffect(() => {
    console.log("Rectangles state updated:", rectangles);
  }, [rectangles]);

  useEffect(() => {
    if (connectionStatus === "Connected") {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectionStatus]);

  return (
    <div className="App">
      <h1>Small Playground For WebSocket-Applications</h1>
      <div className="card">
        <h3>WebSocket Client</h3>
        <p>Press buttons below to connect and disconnect from WebSocket</p>
        <WebSocketComponent
          setWs={setWs}
          setConnectionStatus={setConnectionStatus}
          setMessages={setMessages}
          setToken={setToken}
        />
        <p>Connection: <span style={{ color: "orange" }}>{connectionStatus}</span></p>
        <p>Client: <span style={{ color: "orange" }}>{window.location.hostname}</span></p>
        <p>Server: <span style={{ color: "orange" }}>{ws ? ws.url.slice(5) : ""}</span></p>
        <p>Token: <span style={{ color: "orange" }}>{token}</span></p>
        <h3>Place a pixel in the canvas below to test WebSocket</h3>
        <ColorPicker
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          isConnected={isConnected}
        />
        <Canvas
  ws={ws}
  selectedColor={selectedColor}
  incrementClickCount={incrementClickCount}
  rectangles={rectangles}
  setRectangles={setRectangles}
  isConnected={isConnected}
  currentUser={{ id: "Platzhalter" }} // Ersetzen Sie dies durch die tatsächliche Benutzer-ID
/>
      </div>
    </div>
  );
}

export default App;