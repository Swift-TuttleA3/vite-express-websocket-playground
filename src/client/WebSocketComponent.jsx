import { useEffect, useState } from "react";

const WebSocketComponent = ({ setWs, setConnectionStatus, setMessages, setToken, setWsData, setError }) => {
  const [ws, setLocalWs] = useState(null);

  useEffect(() => {
    if (ws) {
      // WebSocket-Verbindung wurde hergestellt
      ws.onopen = () => {
        console.log("WebSocket-Verbindung hergestellt");
        setConnectionStatus("Verbunden");
      };
      // Nachricht von WebSocket empfangen
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Daten von WebSocket empfangen:", data);
          setWsData((prevData) => [...prevData, JSON.stringify(data)]);
          if (data.error) {
            console.error("Serverfehler: ", data.error);
            setError(data.error);
          } else {
            setMessages((prevMessages) => [...prevMessages, data]);
            if (data.token) {
              console.log("Token empfangen:", data.token);
              setToken(data.token);
              document.cookie = `token=${data.token}; path=/`;
            }
          }
        } catch (error) {
          console.error("Fehler beim Parsen der Nachricht vom Server: ", error);
        }
      };
      // WebSocket-Fehler aufgetreten
      ws.onerror = (error) => {
        console.error("WebSocket-Fehler: ", error);
      };
      // WebSocket-Verbindung wurde geschlossen
      ws.onclose = () => {
        console.log("WebSocket-Verbindung geschlossen");
        setConnectionStatus("Getrennt");
      };
    }
  }, [ws]);

  const connectWebSocket = () => {
    if (ws) {
      // WebSocket-Verbindung schließen
      ws.close();
      setLocalWs(null);
      setWs(null);
    } else {
      // Neue WebSocket-Verbindung herstellen
      const newWs = new WebSocket("ws://localhost:3131");
      setLocalWs(newWs);
      setWs(newWs);
    }
  };

  return (
    <div>
      <button onClick={connectWebSocket}>
        {ws ? "Erneut verbinden" : "Verbinden"}
      </button>
    </div>
  );
};

export default WebSocketComponent;