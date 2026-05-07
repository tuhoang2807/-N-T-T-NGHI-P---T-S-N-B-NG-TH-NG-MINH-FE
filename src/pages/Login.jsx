import React, { useMemo, useState } from "react";
import { Form, Input, Button, Checkbox, Divider, Typography, Space, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authApi } from "../services/api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const bg = useMemo(() => {
    const variants = [
      "radial-gradient(1200px 800px at 10% 10%, rgba(99,102,241,.35), transparent 60%), radial-gradient(1000px 700px at 90% 20%, rgba(16,185,129,.25), transparent 60%), radial-gradient(900px 700px at 40% 90%, rgba(244,114,182,.22), transparent 60%), linear-gradient(180deg, #0b1220 0%, #090d18 100%)",
      "radial-gradient(1100px 750px at 15% 15%, rgba(56,189,248,.28), transparent 60%), radial-gradient(1000px 700px at 85% 25%, rgba(168,85,247,.28), transparent 60%), radial-gradient(900px 700px at 45% 92%, rgba(34,197,94,.18), transparent 60%), linear-gradient(180deg, #070b14 0%, #070a12 100%)",
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }, []);

  const inputStyle = {
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    color: "white",
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.login({
        email: values.email,
        password: values.password,
      });

      const payload = res?.data;
      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const user = payload?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Thiếu dữ liệu đăng nhập từ server");
      }

      login({ accessToken, refreshToken, user });

      message.success("Đăng nhập thành công!");
      navigate(user?.role === "ADMIN" ? "/admin" : "/");
    } catch (e) {
      const apiMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message;
      message.error(apiMsg || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, position: "relative" }}>
      <style>{`
        .glass-input input::placeholder { color: rgba(255,255,255,0.65) !important; }
        .glass-input input { color: #fff !important; }
        .glass-input .ant-input-prefix { color: rgba(255,255,255,0.75) !important; }
        .glass-input .ant-input-password-icon { color: rgba(255,255,255,0.75) !important; }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"180\" height=\"180\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.08\"/></svg>')",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-9 col-lg-7 col-xl-5">
            <div
              className="p-4 p-md-5"
              style={{
                borderRadius: 24,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
                        display: "inline-block",
                      }}
                    />
                    <Text style={{ color: "rgba(255,255,255,0.85)" }}>Secure Login</Text>
                  </div>
                  <Title level={2} style={{ margin: "12px 0 0", color: "white" }}>
                    Chào mừng trở lại
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.70)" }}>
                    Đăng nhập để tiếp tục vào hệ thống.
                  </Text>
                </div>

                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
                  }}
                  title="Your App"
                >
                  <span style={{ fontWeight: 800, color: "white", letterSpacing: 1 }}>APP</span>
                </div>
              </div>

              <Divider style={{ borderColor: "rgba(255,255,255,0.12)", margin: "18px 0" }}>
                <Text style={{ color: "rgba(255,255,255,0.55)" }}>Đăng nhập bằng tài khoản</Text>
              </Divider>

              <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Email</Text>}
                  name="email"
                  rules={[
                    { required: true, message: "Nhập email của bạn" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input
                    className="glass-input"
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="you@company.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Mật khẩu</Text>}
                  name="password"
                  rules={[{ required: true, message: "Nhập mật khẩu" }]}
                >
                  <Input.Password
                    className="glass-input"
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                </Form.Item>

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox style={{ color: "rgba(255,255,255,0.75)" }}>
                      Ghi nhớ đăng nhập
                    </Checkbox>
                  </Form.Item>

                  <Button
                    type="link"
                    style={{ padding: 0, color: "rgba(255,255,255,0.75)" }}
                    onClick={() => navigate("/forgot-password")}
                  >
                    Quên mật khẩu?
                  </Button>
                </div>

                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  loading={loading}
                  block
                  style={{
                    borderRadius: 16,
                    height: 48,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
                    border: "none",
                    boxShadow: "0 18px 45px rgba(99,102,241,0.25)",
                  }}
                >
                  Đăng nhập
                </Button>

                <Space direction="vertical" className="w-100 mt-3" size={6}>
                  <Text style={{ color: "rgba(255,255,255,0.62)" }}>
                    Chưa có tài khoản?{" "}
                    <Button
                      type="link"
                      style={{ padding: 0, color: "white", fontWeight: 700 }}
                      onClick={() => navigate("/register")}
                    >
                      Tạo ngay
                    </Button>
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                    Bằng việc đăng nhập, bạn đồng ý với Điều khoản & Chính sách bảo mật.
                  </Text>
                </Space>
              </Form>
            </div>

            <div className="text-center mt-3" style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              © {new Date().getFullYear()} Your Company · Built with Ant Design + Bootstrap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}