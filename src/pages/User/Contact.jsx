import React, { useState } from "react";
import { Row, Col, Card, Button, Form, Input, message, Tag, Typography, Space } from "antd";
import UserLayout from "../../layouts/UserLayout";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SendOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "animate.css/animate.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: call API
      await new Promise((r) => setTimeout(r, 900));

      message.success("Gửi thông tin thành công! Chúng tôi sẽ phản hồi sớm nhất.");
      form.resetFields();
    } catch (error) {
      // validateFields fail sẽ vào đây, khỏi hiện message lỗi nếu user chưa nhập đủ
      if (error?.errorFields?.length) {
        message.warning("Vui lòng kiểm tra lại thông tin bạn nhập.");
      } else {
        message.error("Có lỗi xảy ra. Thử lại giúp mình nhé.");
      }
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ icon, title, value }) => (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 14,
        borderRadius: 14,
        background: "rgba(56, 161, 105, 0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "rgba(56, 161, 105, 0.14)",
          border: "1px solid rgba(56, 161, 105, 0.22)",
          flex: "0 0 auto",
        }}
      >
        <span style={{ fontSize: 18, color: "#38a169" }}>{icon}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, color: "#1a365d", marginBottom: 2 }}>{title}</div>
        <div style={{ color: "#6c757d", lineHeight: 1.45 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <UserLayout>
      <div
        className="py-5"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,.10), transparent 55%), radial-gradient(1000px 650px at 90% 10%, rgba(16,185,129,.10), transparent 55%), linear-gradient(to bottom, #f8f9fa, #eef2ff)",
        }}
      >
        <div className="container-fluid">
          {/* Header */}
          <div className="text-center mb-4 animate__animated animate__fadeInDown">
            <Title level={2} style={{ marginBottom: 6, color: "#1a365d" }}>
              Liên hệ Tú Hoàng
            </Title>
            <Text style={{ color: "#6c757d", fontSize: 16 }}>
              Gửi câu hỏi/feedback — tụi mình phản hồi nhanh trong giờ làm việc.
            </Text>
            <div className="mt-3">
              <Tag color="green" style={{ borderRadius: 999, padding: "4px 10px" }}>
                <ClockCircleOutlined className="me-1" /> Phản hồi nhanh
              </Tag>
              <Tag color="blue" style={{ borderRadius: 999, padding: "4px 10px" }}>
                Hỗ trợ tiếng Việt 100%
              </Tag>
            </div>
          </div>

          <Row gutter={[24, 24]} justify="center" align="top">
            {/* LEFT: Map */}
            <Col xs={24} lg={12}>
              <Card
                className="border-0 shadow-sm animate__animated animate__fadeInLeft"
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "white",
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div style={{ position: "relative", height: 520 }}>
                  {/* overlay header */}
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      right: 14,
                      zIndex: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <EnvironmentOutlined style={{ color: "#38a169" }} />
                      <Text style={{ color: "#1a365d", fontWeight: 800 }}>Sân bóng Tú Hoàng</Text>
                    </div>

                    <Button
                      size="middle"
                      className="fw-bold"
                      style={{
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                      onClick={() => window.open("https://www.google.com/maps", "_blank")}
                    >
                      Mở Google Maps
                    </Button>
                  </div>

                  {/* map */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447!2d106.669!3d10.776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f22b9e5b!2sS%C3%A2n%20b%C3%B3ng%20ch%C3%A2u%20%C3%A2u%20T%C3%BA%20Ho%C3%A0ng!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Sân Bóng Tú Hoàng - Google Maps"
                  />

                  {/* bottom gradient */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.00) 55%, rgba(0,0,0,0.12) 100%)",
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* RIGHT: Info + Form */}
            <Col xs={24} lg={12}>
              <Card
                className="border-0 shadow-sm animate__animated animate__fadeInRight"
                style={{ borderRadius: 18, background: "white" }}
                styles={{ body: { padding: 18 } }}
              >
                <div className="mb-3">
                  <Title level={3} style={{ marginBottom: 6, color: "#1a365d" }}>
                    Gửi tin nhắn cho tụi mình
                  </Title>
                  <Text style={{ color: "#6c757d" }}>
                    Điền form bên dưới — tụi mình sẽ liên hệ lại qua email/điện thoại.
                  </Text>
                </div>

                {/* Info cards */}
                <Row gutter={[12, 12]} className="mb-3">
                  <Col xs={24}>
                    <InfoItem
                      icon={<EnvironmentOutlined />}
                      title="Địa chỉ"
                      value="Sân Bóng Tú Hoàng, Quận 7, TP. Hồ Chí Minh"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <InfoItem icon={<PhoneOutlined />} title="Điện thoại" value="0123 456 789" />
                  </Col>
                  <Col xs={24} md={12}>
                    <InfoItem icon={<MailOutlined />} title="Email" value="support@tuhuang.com" />
                  </Col>
                </Row>

                {/* Form */}
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                      >
                        <Input
                          placeholder="Ví dụ: Nguyễn Văn A"
                          prefix={<UserOutlined />}
                          style={{ borderRadius: 12 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                        ]}
                      >
                        <Input
                          placeholder="you@email.com"
                          prefix={<MailOutlined />}
                          style={{ borderRadius: 12 }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24}>
                      <Form.Item
                        label="Nội dung"
                        name="message"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
                      >
                        <TextArea
                          rows={5}
                          placeholder="Bạn muốn hỏi gì? (đặt sân, hoàn tiền, ghép đội...)"
                          style={{ borderRadius: 12 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Space className="w-100" direction="vertical" size={10}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      loading={loading}
                      block
                      className="fw-bold"
                      style={{
                        borderRadius: 14,
                        height: 46,
                        background: "linear-gradient(45deg, #38a169, #1a365d)",
                        border: "none",
                        boxShadow: "0 10px 24px rgba(56, 161, 105, 0.22)",
                      }}
                    >
                      Gửi tin nhắn
                    </Button>

                    <Text style={{ color: "#9aa3af", fontSize: 12 }}>
                      Bằng việc gửi, bạn đồng ý để chúng tôi liên hệ lại để hỗ trợ.
                    </Text>
                  </Space>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </UserLayout>
  );
};

export default Contact;
