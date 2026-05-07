import React, { useMemo, useState } from "react";
import { Form, Input, Button, Checkbox, Divider, Typography, Space, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, TeamOutlined } from "@ant-design/icons";
import { authApi } from "../services/api/auth.api";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // ✅ Fix placeholder màu trắng bằng inline CSS variables (works ổn với hầu hết browser)
  // Nếu bạn muốn "trắng hơn" nữa, tăng opacity từ 0.65 -> 0.8
  const placeholderFix = {
    // Antd Input không hỗ trợ placeholderStyle trực tiếp, nên mình dùng trick:
    // set màu placeholder qua CSS global ngay trong component (bên dưới).
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        teamName: values.teamName,
        teamLeadName: values.teamLeadName,
      });

      message.success("Đăng ký thành công! Đang chuyển hướng sang trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (e) {
      message.error(e?.message || "Đăng ký thất bại (email hoặc số điện thoại có thể đã tồn tại)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, position: "relative" }}>
      {/* ✅ placeholder trắng + input text trắng cho antd */}
      <style>{`
        .glass-input input::placeholder { color: rgba(255,255,255,0.65) !important; }
        .glass-input input { color: #fff !important; }
        .glass-input .ant-input-prefix { color: rgba(255,255,255,0.75) !important; }
        .glass-input .ant-input-password-icon { color: rgba(255,255,255,0.75) !important; }
      `}</style>

      {/* noise overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.08"/></svg>\')',
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
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
              {/* Header */}
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
                    <Text style={{ color: "rgba(255,255,255,0.85)" }}>Create Account</Text>
                  </div>

                  <Title level={2} style={{ margin: "12px 0 0", color: "white" }}>
                    Đăng ký tài khoản
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.70)" }}>Tạo tài khoản mới trong vài giây.</Text>
                </div>

                {/* Logo bubble */}
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
                <Text style={{ color: "rgba(255,255,255,0.55)" }}>đăng ký bằng email</Text>
              </Divider>

              <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                {/* Row 1: Fullname + Phone */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Họ và tên</Text>}
                      name="fullName"
                      rules={[{ required: true, message: "Nhập họ và tên" }]}
                    >
                      <Input
                        className="glass-input"
                        size="large"
                        prefix={<UserOutlined />}
                        placeholder="Nguyễn Văn A"
                        autoComplete="name"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Số điện thoại</Text>}
                      name="phone"
                      rules={[
                        { required: true, message: "Nhập số điện thoại" },
                        { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" },
                      ]}
                    >
                      <Input
                        className="glass-input"
                        size="large"
                        prefix={<PhoneOutlined />}
                        placeholder="098xxxxxxx"
                        autoComplete="tel"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Row 2: Email */}
                <Form.Item
                  label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Email</Text>}
                  name="email"
                  rules={[
                    { required: true, message: "Nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input
                    className="glass-input"
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="you@company.com"
                    autoComplete="email"
                    style={inputStyle}
                  />
                </Form.Item>

                {/* Row 3: Team name + Team lead */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Tên đội</Text>}
                      name="teamName"
                      rules={[{ required: true, message: "Nhập tên đội" }]}
                    >
                      <Input
                        className="glass-input"
                        size="large"
                        prefix={<TeamOutlined />}
                        placeholder="FC ABC"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Tên đội trưởng</Text>}
                      name="teamLeadName"
                      rules={[{ required: true, message: "Nhập tên đội trưởng" }]}
                    >
                      <Input
                        className="glass-input"
                        size="large"
                        prefix={<UserOutlined />}
                        placeholder="Nguyễn Văn B"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Row 4: Password + Confirm */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Mật khẩu</Text>}
                      name="password"
                      rules={[
                        { required: true, message: "Nhập mật khẩu" },
                        {
                          pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                          message: "Tối thiểu 8 ký tự, gồm chữ và số",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password
                        className="glass-input"
                        size="large"
                        prefix={<LockOutlined />}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-12 col-md-6">
                    <Form.Item
                      label={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Nhập lại mật khẩu</Text>}
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        { required: true, message: "Nhập lại mật khẩu" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) return Promise.resolve();
                            return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        className="glass-input"
                        size="large"
                        prefix={<LockOutlined />}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        style={inputStyle}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Agree */}
                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error("Bạn cần đồng ý điều khoản")),
                    },
                  ]}
                >
                  <Checkbox style={{ color: "rgba(255,255,255,0.75)" }}>
                    Tôi đồng ý với <span style={{ color: "white", fontWeight: 700 }}>Điều khoản</span> và{" "}
                    <span style={{ color: "white", fontWeight: 700 }}>Chính sách</span>
                  </Checkbox>
                </Form.Item>

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
                  Tạo tài khoản
                </Button>

                <Space direction="vertical" className="w-100 mt-3" size={6}>
                  <Text style={{ color: "rgba(255,255,255,0.62)" }}>
                    Đã có tài khoản?{" "}
                    <Button
                      type="link"
                      style={{ padding: 0, color: "white", fontWeight: 700 }}
                      onClick={() => navigate("/login")}
                    >
                      Đăng nhập
                    </Button>
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                    Mật khẩu nên mạnh: chữ hoa/thường, số, ký tự đặc biệt.
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
