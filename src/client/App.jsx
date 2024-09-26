import { useState, useRef, useEffect } from "react";
import WebSocketComponent from "./WebSocketComponent";
import Canvas from "./Canvas";
import ReadOnlyCanvas from "./ReadOnlyCanvas";
import ColorPicker from "./ColorPicker";
import useFetchCanvasData from "./useFetchCanvasData";
import useInputHandlers from "./useInputHandlers";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [selectedColor, setSelectedColor] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const inputRef = useRef(null);

  const { rectangles, setRectangles, dbRectangles, fetchDbData } = useFetchCanvasData();

  const incrementClickCount = () => {
    setClickCount(clickCount + 1);
  };

  useEffect(() => {
    console.log("Messages state updated:", messages); // Log Nachrichten im Zustand
  }, [messages]);

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
        />
        <p>Connection: <span style={{ color: "orange" }}>{connectionStatus}</span></p>
        <p>Client: <span style={{ color: "orange" }}>{window.location.hostname}</span></p>
        <p>Server: <span style={{ color: "orange" }}>{ws ? ws.url.slice(5) : ""}</span></p>
        <h3>Place a pixel in the canvas below to test WebSocket</h3>
        <ColorPicker selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
        <Canvas
          ws={ws}
          selectedColor={selectedColor}
          incrementClickCount={incrementClickCount}
          rectangles={rectangles}
          setRectangles={setRectangles}
        />
        <h3>Read-Only Canvas (Database State)</h3>
        <button onClick={fetchDbData}>Fetch DB Data</button>
        <ReadOnlyCanvas rectangles={dbRectangles} />
      </div>
      <div className="card">
        <div style={{ display: "flex" }}>
          <ul className="msg-box" style={{ flex: 1 }}>
            <h2>Messages from Websocket-Server on ws://localhost:3131</h2>
            {messages.map((msg, index) => (
              <li key={index}>
                <span style={{ color: "black" }}>
                  {msg.message} (x: {msg.position?.x}, y: {msg.position?.y}) - Color: {msg.color} - Timestamp: {msg.timestamp} - Click Count: {msg.clickCount}
                </span>
              </li>
            ))}
          </ul>
          <ul className="msg-box" style={{ flex: 1 }}>
            <h2>Messages from mongoDB-Server on ws://localhost:3000</h2>
            {dbRectangles.map((rect, index) => (
              <li key={index}>
                <span style={{ color: "black" }}>
                  (x: {rect.position.x}, y: {rect.position.y}) - Color: {rect.color} - Timestamp: {rect.timestamp} - Click Count: {rect.clickCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;