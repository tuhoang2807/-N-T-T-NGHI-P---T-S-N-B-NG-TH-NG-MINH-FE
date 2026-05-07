import { Client } from "@stomp/stompjs";
import { tokenStorage } from "../auth/tokenStorage";
import { ENV } from "../../config/env";

let client = null;
let sub = null;

function toWsUrl(httpUrl) {
  if (!httpUrl) return "";
  if (httpUrl.startsWith("https://")) return httpUrl.replace("https://", "wss://");
  return httpUrl.replace("http://", "ws://");
}

export const matchChatSocket = {
  connect(postId, onMessage) {
    const token = tokenStorage.getAccessToken();

    // reset session cũ
    this.disconnect();

    const wsBase = toWsUrl(ENV.API_BASE_URL);
    const brokerURL = `${wsBase}/ws`;

    console.log("[WS] CONNECT ->", brokerURL, "postId=", postId);

    client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },

      // bật log để bạn thấy chắc chắn có connect/send/recv
      debug: (str) => console.log("[STOMP]", str),

      reconnectDelay: 2000,

      onConnect: () => {
        console.log("[WS] CONNECTED ✅");

        const topic = `/topic/match/${postId}`;
        console.log("[WS] SUB ->", topic);

        sub = client.subscribe(topic, (frame) => {
          console.log("[WS] RECV raw ->", frame.body);
          try {
            const msg = JSON.parse(frame.body);
            console.log("[WS] RECV json ->", msg);
            onMessage?.(msg);
          } catch (e) {
            console.error("[WS] parse error", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("[WS] STOMP ERROR", frame);
      },

      onWebSocketError: (e) => {
        console.error("[WS] SOCKET ERROR", e);
      },

      onWebSocketClose: (e) => {
        console.warn("[WS] SOCKET CLOSE", e);
      },
    });

    client.activate();
  },

  send(postId, content) {
    if (!client || !client.connected) {
      console.warn("[WS] SEND blocked ❌ (not connected yet)");
      return false;
    }

    const dest = `/app/match/${postId}/send`;
    console.log("[WS] SEND ->", dest, content);

    client.publish({
      destination: dest,
      body: JSON.stringify({ content }),
    });

    return true;
  },

  disconnect() {
    try {
      if (sub) sub.unsubscribe();
    } catch {}
    sub = null;

    try {
      if (client) client.deactivate();
    } catch {}
    client = null;
  },
};