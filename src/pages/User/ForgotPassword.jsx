import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Card, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { authApi } from "./../../services/api/auth.api";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      message.warning("Nhập email trước");
      return;
    }

    try {
      setLoadingSend(true);
      const res = await authApi.forgotPassword({ email });
      message.success(res?.message || "OTP đã được gửi về email");
      setOtpSent(true);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || "Không gửi được OTP");
    } finally {
      setLoadingSend(false);
    }
  };

  const onReset = async (values) => {
    try {
      setLoadingReset(true);
      const res = await authApi.resetPassword({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      message.success(res?.message || "Đổi mật khẩu thành công");
      navigate("/login");
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f5f5",
        padding: 16,
      }}
    >
      <Card style={{ width: 420, borderRadius: 16 }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Quên mật khẩu
            </Title>
            <Text type="secondary">
              Nhập email để nhận OTP và đặt lại mật khẩu.
            </Text>
          </div>

          <Input
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="large"
          />

          <Button
            type="primary"
            block
            size="large"
            loading={loadingSend}
            onClick={sendOtp}
          >
            Gửi OTP
          </Button>

          {otpSent && (
            <Form layout="vertical" onFinish={onReset}>
              <Form.Item
                label="OTP"
                name="otp"
                rules={[{ required: true, message: "Nhập OTP" }]}
              >
                <Input size="large" placeholder="6 số OTP" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
              >
                <Input.Password size="large" placeholder="Mật khẩu mới" />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                block
                size="large"
                loading={loadingReset}
              >
                Đổi mật khẩu
              </Button>
            </Form>
          )}

          <Button type="link" onClick={() => navigate("/login")}>
            Quay lại đăng nhập
          </Button>
        </Space>
      </Card>
    </div>
  );
}