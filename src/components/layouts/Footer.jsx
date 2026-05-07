import React from "react";
import { Row, Col, Input } from "antd";
import { MailOutlined, PhoneOutlined, FacebookOutlined, InstagramOutlined, EnvironmentOutlined, ReadOutlined } from "@ant-design/icons";

const { Search } = Input;

const Footer = () => {
  return (
    <footer 
      className="py-5 mt-auto position-relative" 
      style={{ 
        backgroundColor: "#1a365d",
        color: "white",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 -4px 20px rgba(0, 118, 225, 0.15)",
      }}
    >
      <div className="container-fluid">
        <Row gutter={[32, 32]} justify="space-between" align="top">
          {/* Phần trái: Logo & Copyright */}
          <Col xs={24} md={6}>
            <div className="d-flex align-items-center mb-4">
              <a href="/" className="text-decoration-none d-flex align-items-center">
                <EnvironmentOutlined className="me-2 fs-3 text-success" />
                <strong className="fs-3 text-white fw-bold" style={{ letterSpacing: "1px" }}>Tú Hoàng</strong>
              </a>
            </div>
            <small className="text-light opacity-90 fs-6">&copy; 2025. All rights reserved.</small>
            <p className="text-light opacity-85 fs-6 mt-3 mb-0" style={{ lineHeight: 1.5 }}>Hệ thống đặt sân bóng thông minh với AI hỗ trợ.</p>
          </Col>

          {/* Phần giữa: Links chính */}
          <Col xs={24} md={6}>
            <h6 className="fw-bold text-white mb-4 fs-5" style={{ letterSpacing: "1px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Sản Phẩm</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-3">
                <a 
                  href="/news" 
                  className="text-white text-decoration-none fw-semibold d-flex align-items-center fs-6"
                  style={{ 
                    transition: "all 0.3s ease", 
                    borderBottom: "1px solid transparent",
                    padding: "0.5rem 0",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#38a169";
                    e.target.style.borderBottomColor = "#38a169";
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "white";
                    e.target.style.borderBottomColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  <ReadOutlined className="me-3 fs-5" /> Tin tức
                </a>
              </li>
              <li className="mb-3">
                <a 
                  href="/contact" 
                  className="text-white text-decoration-none fw-semibold d-flex align-items-center fs-6"
                  style={{ transition: "all 0.3s ease", borderBottom: "1px solid transparent", padding: "0.5rem 0" }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#38a169";
                    e.target.style.borderBottomColor = "#38a169";
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "white";
                    e.target.style.borderBottomColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  <PhoneOutlined className="me-3 fs-5" /> Liên hệ
                </a>
              </li>
              <li className="mb-3">
                <a 
                  href="/terms" 
                  className="text-white text-decoration-none fw-semibold d-flex align-items-center fs-6"
                  style={{ transition: "all 0.3s ease", borderBottom: "1px solid transparent", padding: "0.5rem 0" }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#38a169";
                    e.target.style.borderBottomColor = "#38a169";
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "white";
                    e.target.style.borderBottomColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  📄 Điều khoản
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-white text-decoration-none fw-semibold d-flex align-items-center fs-6"
                  style={{ transition: "all 0.3s ease", borderBottom: "1px solid transparent", padding: "0.5rem 0" }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#38a169";
                    e.target.style.borderBottomColor = "#38a169";
                    e.target.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "white";
                    e.target.style.borderBottomColor = "transparent";
                    e.target.style.transform = "translateX(0)";
                  }}
                >
                  🔒 Bảo mật
                </a>
              </li>
            </ul>
          </Col>

          {/* Phần phải: Thông tin liên hệ & Social */}
          <Col xs={24} md={6}>
            <h6 className="fw-bold text-white mb-4 fs-5" style={{ letterSpacing: "1px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Liên Hệ</h6>
            <div className="mb-4">
              <p className="mb-3 text-light opacity-90 fs-6 d-flex align-items-center">
                <MailOutlined className="me-3 fs-5 text-success" />
                <a href="mailto:info@tuhuong.com" className="text-white text-decoration-none">info@tuhuong.com</a>
              </p>
              <p className="mb-0 text-light opacity-90 fs-6 d-flex align-items-center">
                <PhoneOutlined className="me-3 fs-5 text-success" />
                <span className="text-white fw-bold">0123 456 789</span>
              </p>
            </div>
            {/* Social icons */}
            <div className="d-flex gap-4">
              <a 
                href="https://facebook.com" 
                className="text-white p-3 rounded d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  transition: "all 0.3s ease",
                  width: 50, 
                  height: 50 // Xóa comment ở đây, giờ sạch sẽ
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#38a169";
                  e.target.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                <FacebookOutlined className="fs-4" />
              </a>
              <a 
                href="https://instagram.com" 
                className="text-white p-3 rounded d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  transition: "all 0.3s ease",
                  width: 50, 
                  height: 50
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#38a169";
                  e.target.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                <InstagramOutlined className="fs-4" />
              </a>
            </div>
          </Col>

          {/* Phần newsletter */}
          <Col xs={24} md={6}>
            <h6 className="fw-bold text-white mb-4 fs-5" style={{ letterSpacing: "1px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Nhận Ưu Đãi</h6>
            <p className="text-light opacity-90 fs-6 mb-4" style={{ lineHeight: 1.5 }}>
              Đăng ký nhận gợi ý khung giờ AI & khuyến mãi.
            </p>
            <div className="input-group input-group-md">
              <input 
                type="email" 
                className="form-control rounded-0" 
                placeholder="Email của bạn" 
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.15)", 
                  border: "1px solid rgba(255,255,255,0.3)", 
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                  e.target.style.borderColor = "#38a169";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                }}
              />
              <button className="btn btn-success rounded-0 px-4 fw-bold" style={{ borderRadius: 0 }}>Đăng ký</button>
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  );
};

export default Footer;