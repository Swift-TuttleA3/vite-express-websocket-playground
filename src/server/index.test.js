import { WebSocketServer } from "ws";
import { jest } from "@jest/globals";
import { createServer } from "http";
import WebSocket from "ws";

describe("WebSocket Server", () => {
  let server;
  let wss;
  let client;

  beforeAll((done) => {
    server = createServer();
    wss = new WebSocketServer({ server });
    server.listen(3131, done);
  });

  afterAll((done) => {
    wss.close(() => {
      server.close(done);
    });
  });

  beforeEach((done) => {
    client = new WebSocket("ws://localhost:3131");
    client.on("open", done);
  });

  afterEach((done) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
    client.on("close", done);
  });

  test("should decrease user count on client disconnect", (done) => {
    let initialUserCount;

    wss.on("connection", (ws) => {
      initialUserCount = wss.clients.size;

      ws.on("close", () => {
        const finalUserCount = wss.clients.size;
        expect(finalUserCount).toBe(initialUserCount - 1);
        done();
      });

      // Close the client connection to trigger the "close" event
      client.close();
    });
  });

  test("should broadcast updated user count on client disconnect", (done) => {
    let initialUserCount;

    wss.on("connection", (ws) => {
      initialUserCount = wss.clients.size;

      ws.on("close", () => {
        wss.clients.forEach((client) => {
          client.on("message", (message) => {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === "userCount") {
              expect(parsedMessage.count).toBe(initialUserCount - 1);
              done();
            }
          });
        });

        // Close the client connection to trigger the "close" event
        client.close();
      });
    });
  });
});
