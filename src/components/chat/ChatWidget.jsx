import React, { useEffect, useRef, useState } from "react";
import {
  FloatButton,
  Drawer,
  Input,
  Button,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Chào bạn! Bạn muốn đặt sân số mấy?" },
  ]);

  const boxRef = useRef(null);

  const scrollBottom = () => {
    setTimeout(() => {
      if (boxRef.current)
        boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }, 0);
  };

  // tạo session id để bot nhớ theo user
  const getSessionId = () => {
    let sid = localStorage.getItem("chat_sid");
    if (!sid) {
      sid = (
        crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
      ).toString();
      localStorage.setItem("chat_sid", sid);
    }
    return sid;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    scrollBottom();

    try {
      const sid = getSessionId();
      const authRaw = localStorage.getItem("auth");
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const token = auth?.accessToken;
      const userId = auth?.user?.userId;
      const res = await axios.post(
        "http://127.0.0.1:8000/chat",
        { messages: next, session_id: sid, user_id: userId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply || "Mình chưa nhận được phản hồi.",
        },
      ]);
      scrollBottom();
    } catch (e) {
      console.error(e);
      message.error("Không kết nối được chatbot. Kiểm tra server python nhé.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Mình đang lỗi kết nối. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollBottom();
    }
  };

  // optional: mở chat thì auto scroll
  useEffect(() => {
    if (open) scrollBottom();
  }, [open]);

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        onClick={() => setOpen(true)}
        tooltip="Chat hỗ trợ"
      />

      <Drawer
        title="💬 Hỗ trợ đặt sân"
        placement="right"
        width={360}
        open={open}
        onClose={() => setOpen(false)}
        bodyStyle={{ padding: 12, display: "flex", flexDirection: "column" }}
      >
        <div
          ref={boxRef}
          className="flex-grow-1 mb-2"
          style={{
            overflowY: "auto",
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`d-flex mb-2 ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#e6f4ff" : "#ffffff",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Text>{m.content}</Text>
              </div>
            </div>
          ))}

          {loading && (
            <Space>
              <Spin size="small" />
              <Text type="secondary">Đang trả lời...</Text>
            </Space>
          )}
        </div>

        <Space.Compact>
          <Input
            value={input}
            placeholder="Nhập tin nhắn..."
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={send}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={send}
            loading={loading}
          >
            Gửi
          </Button>
        </Space.Compact>
      </Drawer>
    </>
  );
}
