import React, { useEffect, useState } from "react";
import { Row, Col, Button } from "antd";
import { ArrowRightOutlined, RobotOutlined } from "@ant-design/icons";
import banner from "../../assets/img/banner.jpg";
import "animate.css/animate.css";

const Banner = () => {
  const [scrollY, setScrollY] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const fullText =
    "Giải pháp đặt sân bóng hiện đại giúp bạn dễ dàng đặt sân, nạp tiền thanh toán online, ghép đội và nhận hỗ trợ nhanh chóng từ chatbot.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="p-5 position-relative overflow-hidden py-5 animate__animated animate__fadeIn"
      style={{
        minHeight: "100vh",
        backgroundImage: `radial-gradient(circle at 30% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 50%), 
                    linear-gradient(135deg, rgba(26, 54, 93, 0.85), rgba(0, 0, 0, 0.5)), 
                    url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "white",
        display: "flex",
        alignItems: "center",
        transform: `translateY(${scrollY * 0.3}px)`,
      }}
    >
      {/* Floating particles */}
      <div className="position-absolute top-0 left-0 w-100 h-100 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="position-absolute animate__animated animate__float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: "4px",
              height: "4px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "50%",
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="container-fluid">
        <Row justify="center" align="middle">
          <Col
            xs={24}
            md={12}
            className="text-center text-md-start mb-4 mb-md-0 animate__animated animate__fadeInDown"
          >
            <h1
              className="display-1 fw-bold mb-4"
              style={{
                background: "linear-gradient(45deg, #38a169, #ffffff, #1a365d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow:
                  "0 0 30px rgba(56, 161, 105, 0.8), 0 4px 20px rgba(0,0,0,0.7)",
                letterSpacing: "3px",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              Đặt Sân Tú Hoàng
            </h1>

            <p
              className="lead fs-2 mb-5 opacity-100 typewriter-text animate__animated animate__fadeInUp"
              style={{
                lineHeight: 1.4,
                textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
                maxWidth: "700px",
                borderRight: "2px solid #38a169",
                color: "white !important",
              }}
            >
              {typewriterText}
              <span className="animate-blink" style={{ color: "#38a169" }}>
                |
              </span>
            </p>

            {/* Stats Counter */}
            <div
              className="d-flex gap-4 mb-4 animate__animated animate__fadeInUp"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="text-center animate__animated animate__pulse animate__infinite">
                <h3
                  className="fw-bold text-success mb-0"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  5000+
                </h3>
                <small className="text-light opacity-95">
                  Đặt sân thành công
                </small>
              </div>
              <div className="text-center animate__animated animate__pulse animate__infinite">
                <h3
                  className="fw-bold text-success mb-0"
                  style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                >
                  24/7
                </h3>
                <small className="text-light opacity-95">Hỗ trợ chatbot</small>
              </div>
            </div>

            {/* CTA Buttons - Fix focus/click */}
            <div className="d-flex flex-column flex-md-row gap-4 justify-content-center justify-content-md-start animate__animated animate__zoomIn">
              <Button
                type="primary"
                size="large"
                className="fw-bold px-6 rounded-pill shadow-lg position-relative overflow-hidden custom-btn-no-outline"
                style={{
                  background: "linear-gradient(45deg, #38a169, #2f855a)",
                  border: "none",
                  transition: "all 0.5s ease",
                  height: 65,
                  boxShadow: "0 10px 30px rgba(56, 161, 105, 0.5)",
                  color: "white !important",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-5px) scale(1.03)";
                  e.target.style.boxShadow =
                    "0 15px 40px rgba(56, 161, 105, 0.7)";
                  const ripple = document.createElement("span");
                  ripple.style.position = "absolute";
                  ripple.style.borderRadius = "50%";
                  ripple.style.background = "rgba(255,255,255,0.6)";
                  ripple.style.transform = "scale(0)";
                  ripple.style.animation = "ripple 0.6s linear";
                  ripple.style.left = "50%";
                  ripple.style.top = "50%";
                  ripple.style.width = "20px";
                  ripple.style.height = "20px";
                  e.target.appendChild(ripple);
                  setTimeout(() => ripple.remove(), 600);
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow =
                    "0 10px 30px rgba(56, 161, 105, 0.5)";
                }}
                onClick={(e) => e.preventDefault()}
              >
                Đặt sân ngay{" "}
                <ArrowRightOutlined className="ms-2 animate__animated animate__bounce animate__infinite" />
              </Button>

              <Button
                size="large"
                className="fw-bold px-6 rounded-pill border-0 shadow position-relative overflow-hidden custom-btn-no-outline"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(15px)",
                  color: "white !important",
                  border: "2px solid rgba(255,255,255,0.4)",
                  transition: "all 0.5s ease",
                  height: 65,
                  boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.25)";
                  e.target.style.borderColor = "rgba(56, 161, 105, 0.8)";
                  e.target.style.transform = "translateY(-5px) scale(1.02)";
                  const ripple = document.createElement("span");
                  ripple.style.position = "absolute";
                  ripple.style.borderRadius = "50%";
                  ripple.style.background = "rgba(255,255,255,0.4)";
                  ripple.style.transform = "scale(0)";
                  ripple.style.animation = "ripple 0.6s linear";
                  ripple.style.left = "50%";
                  ripple.style.top = "50%";
                  ripple.style.width = "20px";
                  ripple.style.height = "20px";
                  e.target.appendChild(ripple);
                  setTimeout(() => ripple.remove(), 600);
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.15)";
                  e.target.style.borderColor = "rgba(255,255,255,0.4)";
                  e.target.style.transform = "translateY(0) scale(1)";
                }}
                onClick={(e) => e.preventDefault()}
              >
                Xem thông tin về sân
              </Button>
            </div>
          </Col>

          <Col
            xs={24}
            md={12}
            className="text-center animate__animated animate__slideInUp"
          >
            <div
              className="position-relative mx-auto"
              style={{ maxWidth: 500, perspective: "1000px" }}
            >
              <div
                className="p-5 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-20 shadow-xl animate__animated animate__flipInX"
                style={{
                  backdropFilter: "blur(25px)",
                  transition: "all 0.5s ease",
                  borderRadius: "25px",
                  transformStyle: "preserve-3d",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "rotateY(10deg) scale(1.05)";
                  e.target.style.boxShadow = "0 25px 50px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "rotateY(0deg) scale(1)";
                  e.target.style.boxShadow = "0 15px 35px rgba(0,0,0,0.3)";
                }}
              >
                <RobotOutlined className="fs-1 text-success mb-4 d-block animate__animated animate__pulse animate__infinite" />
                <h5 className="fw-bold text-dark mb-3 fs-3">
                  Trải nghiệm đặt sân tiện lợi
                </h5>
                <p className="opacity-100 mb-0 text-dark fs-5">
                  Hệ thống hỗ trợ người dùng với các tính năng đặt sân, thanh
                  toán online bằng ví nạp tiền, ghép đội và chatbot tư vấn nhanh
                  chóng.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Scroll indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-5 text-center animate__animated animate__fadeInUp">
        <div
          className="rounded-circle d-inline-block p-4 position-relative"
          style={{
            backgroundColor: "rgba(56, 161, 105, 0.25)",
            border: "2px solid rgba(255,255,255,0.4)",
            transition: "all 0.4s ease",
            boxShadow: "0 0 20px rgba(56, 161, 105, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(56, 161, 105, 0.5)";
            e.target.style.boxShadow = "0 0 30px rgba(56, 161, 105, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(56, 161, 105, 0.25)";
            e.target.style.boxShadow = "0 0 20px rgba(56, 161, 105, 0.3)";
          }}
        >
          <i className="fas fa-chevron-down text-success fs-1 animate__animated animate__bounce animate__infinite"></i>
        </div>
        <small className="text-light opacity-95 d-block mt-3 fs-6">
          Khám phá thêm
        </small>
      </div>
    </section>
  );
};

export default Banner;