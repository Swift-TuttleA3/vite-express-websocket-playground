import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const inputRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX.toFixed(3),
        y: event.clientY.toFixed(3),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        console.log("WebSocket connection established");
        setConnectionStatus("Connected");
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Message from server: ", data);
          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
          console.error("Error parsing message from server: ", error);
        }
      };
      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
      };
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionStatus("Disconnected");
      };
    }
  }, [ws]);

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
    }
    setWs(new WebSocket("ws://localhost:3131"));
  };

  const sendMessage = () => {
    if (ws && inputValue.trim() !== "") {
      const messageData = {
        message: inputValue,
        position: mousePosition,
      };
      ws.send(JSON.stringify(messageData));
      setInputValue("");
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const showRoutes = () => {
    console.log("Routes: /home, /admin, /admin/users, /admin/users/:id");
  };

  const reconnect = () => {
    connectWebSocket();
  };

  return (
    <div className="App">
      <h2>Small Playground For WebSocket-Applications</h2>
      <div className="card">
        <h3>WebSocket Client</h3>
        <p>Press buttons below to connect and disconnect from WebSocket</p>
        <button onClick={() => ws ? ws.close() : setWs(new WebSocket("ws://localhost:3131"))}>
          {ws ? "Disconnect" : "Connect"}
        </button>
        <p>Connection: <span style={{ color: "red" }}>{connectionStatus}</span></p>
        <p>Client: <span style={{ color: "red" }}>{window.location.hostname}</span></p>
        <p>Server: <span style={{ color: "red" }}>{ ws ? ws.url.slice(5) : "" }</span></p>
        <button onClick={reconnect}>Reconnect</button>
        <p>Enter a message below.</p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          ref={inputRef}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="card">
        <h4>Messages from Server on ws://localhost:3131</h4>
        <ul id="msg-box">
          {messages.map((msg, index) => (
            <li key={index}>
              <span style={{ color: "purple" }}>
                {msg.message} (x: {msg.position.x}, y: {msg.position.y})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

/*
import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [inputValue, setInputValue] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");


  const inputRef = useRef(null);

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        console.log("WebSocket connection established");
        setConnectionStatus("Connected");
      };
      ws.onmessage = (event) => {
        console.log("Message from server: ", event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };
      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
      };
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionStatus("Disconnected");
      };
    }
  }, [ws]);

  const sendMessage = () => {
    if (ws && inputValue.trim() !== "") {
      ws.send(inputValue);
      setInputValue("");
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const showRoutes = () => {
    console.log("Routes: /home, /admin, /admin/users, /admin/users/:id");
  };

  const reconnect = () => {
    if (ws) {
      ws.close();
    }
    setWs(new WebSocket("ws://localhost:3131"));
  };

  return (
    <div className="App">
      <h2>Small Playground For WebSocket-Applications</h2>
        <div className="card">
        <h3>WebSocket Client</h3>
        <p>Press buttons below to connect and disconnect from WebSocket</p>
        <button onClick={() => ws ? ws.close() : setWs(new WebSocket("ws://localhost:3131"))}>
          {ws ? "Disconnect" : "Connect"}
        </button>
        <p>Connection: <span style={{ color: "red" }}>{connectionStatus}</span></p>
        <p>Client: <span style={{ color: "red" }}>{window.location.hostname}</span></p>
        <p>Server: <span style={{ color: "red" }}>{ ws ? ws.toString().slice(7, -1) : "" }</span></p>
        <button onClick={reconnect}>Reconnect</button>
        <p>Enter a message below.</p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          ref={inputRef}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="card">
        <h4>Messages from Server on ws://localhost:3131</h4>
        <ul id="msg-box">
          {messages.map((msg, index) => (
            <li key={index}><span style={{ color: "purple" }}>{msg}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
*/