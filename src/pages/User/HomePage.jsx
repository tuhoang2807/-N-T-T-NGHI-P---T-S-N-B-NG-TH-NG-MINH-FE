import React, { useEffect, useMemo, useRef } from "react";
import { Row, Col, Card, Button, Collapse, Typography, Tag, Space } from "antd";
import UserLayout from "../../layouts/UserLayout";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  TeamOutlined,
  CreditCardOutlined,
  RobotOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  StarOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "animate.css/animate.css";

const { Title, Text } = Typography;

const safeImg = (url) => `${url}&auto=format&fit=crop&w=1400&q=80`;
const FALLBACK = "https://picsum.photos/seed/tuhuangfootball/1400/900";

const Home = () => {
  const observeRefs = useRef([]);
  const faqRef = useRef(null);

  const images = useMemo(
    () => ({
      hero: safeImg(
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3"
      ),
      booking: safeImg(
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3"
      ),
      team: safeImg(
        "https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3"
      ),
      wallet: safeImg(
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3"
      ),
      chatbot: safeImg(
        "https://images.unsplash.com/photo-1547347298-4074fc3086f0?ixlib=rb-4.0.3"
      ),
      history: safeImg(
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-4.0.3"
      ),
      review: safeImg(
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3"
      ),
      notify: safeImg(
        "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?ixlib=rb-4.0.3"
      ),
      nearby: safeImg(
        "https://images.unsplash.com/photo-1486286701208-1d58e9338013?ixlib=rb-4.0.3"
      ),
      match: safeImg(
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3"
      ),
      field: safeImg(
        "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?ixlib=rb-4.0.3"
      ),
      support: safeImg(
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3"
      ),
    }),
    []
  );

  const features = useMemo(
    () => [
      {
        icon: <CalendarOutlined />,
        color: "#28a745",
        title: "Đặt sân nhanh chóng",
        desc: "Xem lịch trống, chọn sân và đặt lịch thi đấu chỉ trong vài bước.",
        anim: "animate__slideInLeft",
        img: images.booking,
      },
      {
        icon: <CreditCardOutlined />,
        color: "#ffc107",
        title: "Nạp tiền thanh toán online",
        desc: "Người dùng có thể nạp tiền vào tài khoản để thanh toán tiện lợi và nhanh chóng.",
        anim: "animate__slideInLeft",
        img: images.wallet,
      },
      {
        icon: <TeamOutlined />,
        color: "#007bff",
        title: "Ghép đội bóng",
        desc: "Kết nối người chơi, hỗ trợ tìm đồng đội hoặc đối thủ phù hợp để thi đấu.",
        anim: "animate__slideInLeft",
        img: images.team,
      },
      {
        icon: <RobotOutlined />,
        color: "#6f42c1",
        title: "Chatbot hỗ trợ người dùng",
        desc: "Hỗ trợ giải đáp nhanh các thắc mắc về đặt sân, thanh toán và sử dụng hệ thống.",
        anim: "animate__slideInLeft",
        img: images.chatbot,
      },
      {
        icon: <CalendarOutlined />,
        color: "#dc3545",
        title: "Lịch sử đặt sân",
        desc: "Theo dõi các lượt đặt sân trước đó và kiểm tra thông tin giao dịch dễ dàng.",
        anim: "animate__slideInRight",
        img: images.history,
      },
      {
        icon: <StarOutlined />,
        color: "#fd7e14",
        title: "Đánh giá sân bóng",
        desc: "Người dùng có thể để lại đánh giá và phản hồi sau khi sử dụng sân.",
        anim: "animate__slideInRight",
        img: images.review,
      },
      {
        icon: <SafetyOutlined />,
        color: "#20c997",
        title: "Thông báo tiện lợi",
        desc: "Nhắc lịch thi đấu, xác nhận đặt sân và cập nhật trạng thái giao dịch cho người dùng.",
        anim: "animate__slideInRight",
        img: images.notify,
      },
      {
        icon: <EnvironmentOutlined />,
        color: "#e83e8c",
        title: "Tìm sân phù hợp",
        desc: "Hỗ trợ người dùng tìm sân bóng phù hợp theo nhu cầu và khung giờ mong muốn.",
        anim: "animate__slideInRight",
        img: images.nearby,
      },
    ],
    [images]
  );

  const community = useMemo(
    () => [
      {
        icon: <TeamOutlined />,
        color: "#007bff",
        tag: "Ghép đội",
        title: "Kết nối người chơi",
        desc: "Tạo môi trường giao lưu, ghép đội và tổ chức các trận bóng dễ dàng hơn.",
        anim: "animate__slideInUp",
        img: images.match,
      },
      {
        icon: <TrophyOutlined />,
        color: "#ffc107",
        tag: "Sân bóng",
        title: "Không gian thi đấu chất lượng",
        desc: "Hình ảnh sân bóng trực quan giúp người dùng dễ dàng lựa chọn địa điểm phù hợp.",
        anim: "animate__slideInUp",
        img: images.field,
      },
      {
        icon: <RobotOutlined />,
        color: "#6f42c1",
        tag: "Hỗ trợ",
        title: "Trợ lý hỗ trợ nhanh",
        desc: "Chatbot đồng hành cùng người dùng trong quá trình sử dụng hệ thống.",
        anim: "animate__slideInUp",
        img: images.support,
      },
    ],
    [images]
  );

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const anim = entry.target.dataset.anim || "animate__fadeInUp";
          const delay = entry.target.dataset.delay || "0s";
          entry.target.style.setProperty("--animate-delay", delay);
          entry.target.classList.add("animate__animated", anim);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -60px 0px" }
    );

    observeRefs.current.forEach((el) => el && io.observe(el));
    if (faqRef.current) io.observe(faqRef.current);

    return () => io.disconnect();
  }, []);

  const setRef = (i) => (el) => (observeRefs.current[i] = el);

  const Img = (props) => (
    <img
      {...props}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK) e.currentTarget.src = FALLBACK;
      }}
    />
  );

  return (
    <UserLayout>
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          {/* HERO */}
          <section
            className="py-5"
            style={{
              background:
                "radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,.14), transparent 60%), radial-gradient(1000px 650px at 90% 20%, rgba(16,185,129,.12), transparent 60%), linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%)",
            }}
          >
            <div className="container-fluid">
              <Row justify="center" align="middle" gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <div
                    className="animate__animated animate__fadeInDown"
                    style={{
                      display: "inline-flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "rgba(26,54,93,0.06)",
                      border: "1px solid rgba(26,54,93,0.10)",
                      marginBottom: 14,
                    }}
                  >
                    <RobotOutlined style={{ color: "#1a365d" }} />
                    <Text style={{ color: "#1a365d" }}>
                      Đặt sân • Nạp tiền • Ghép đội • Chatbot hỗ trợ
                    </Text>
                  </div>

                  <Title
                    level={1}
                    className="animate__animated animate__fadeInDown"
                    style={{ color: "#1a365d" }}
                  >
                    Tú Hoàng — Nền tảng đặt sân bóng tiện lợi
                  </Title>

                  <Text
                    className="animate__animated animate__fadeInUp"
                    style={{
                      display: "block",
                      color: "#6c757d",
                      fontSize: 18,
                      lineHeight: 1.7,
                    }}
                  >
                    Hệ thống hỗ trợ người dùng đặt sân bóng nhanh chóng, nạp tiền để thanh toán online,
                    ghép đội thi đấu và nhận hỗ trợ trực tiếp từ chatbot trong cùng một nền tảng.
                  </Text>

                  <div className="d-flex flex-column flex-md-row gap-3 mt-4 animate__animated animate__zoomIn">
                    <Button type="primary" size="large" className="fw-bold px-5">
                      Đặt sân ngay <ArrowRightOutlined className="ms-2" />
                    </Button>
                    <Button
                      size="large"
                      className="fw-bold px-5"
                      style={{ borderColor: "#1a365d", color: "#1a365d" }}
                    >
                      Xem thêm tính năng
                    </Button>
                  </div>
                </Col>

                <Col xs={24} lg={10}>
                  <div
                    className="animate__animated animate__fadeInRight"
                    style={{
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 18px 50px rgba(0,0,0,0.08)",
                      background: "white",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <Img
                        src={images.hero}
                        alt="Sân bóng đá"
                        style={{
                          width: "100%",
                          height: 380,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
                        }}
                      />
                      <div style={{ position: "absolute", left: 16, bottom: 16 }}>
                        <Tag color="green" style={{ borderRadius: 999, padding: "2px 10px" }}>
                          Hệ thống đặt sân bóng
                        </Tag>
                        <div style={{ color: "white", fontWeight: 900, fontSize: 18 }}>
                          Đặt sân dễ dàng và nhanh chóng
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.85)" }}>
                          Thanh toán online • Ghép đội • Hỗ trợ chatbot
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <Text style={{ color: "#6c757d" }}>
                        Trải nghiệm đặt sân bóng hiện đại trên một nền tảng thống nhất.
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* FEATURES */}
          <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="container-fluid">
              <Title level={2} className="text-center fw-bold mb-2">
                Tính năng nổi bật
              </Title>
              <Text className="text-center d-block mb-5" style={{ color: "#6c757d" }}>
                Đặt sân → nạp tiền → thanh toán → ghép đội → hỗ trợ người dùng.
              </Text>

              <Row gutter={[24, 24]} justify="center" align="stretch">
                {features.map((f, idx) => (
                  <Col xs={24} md={12} lg={6} key={idx}>
                    <Card
                      ref={setRef(idx)}
                      data-anim={f.anim}
                      data-delay={`${idx * 0.06}s`}
                      hoverable
                      className="h-100 border-0 shadow-sm"
                      style={{ borderRadius: 16, background: "white", height: "100%" }}
                      styles={{ body: { padding: 16 } }}
                    >
                      <div
                        style={{
                          borderRadius: 14,
                          overflow: "hidden",
                          height: 120,
                          marginBottom: 12,
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <Img
                          src={f.img}
                          alt={f.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          background: `${f.color}14`,
                          border: `1px solid ${f.color}22`,
                          marginBottom: 10,
                        }}
                      >
                        <span style={{ fontSize: 20, color: f.color }}>{f.icon}</span>
                      </div>

                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: "#111827",
                          marginBottom: 6,
                        }}
                      >
                        {f.title}
                      </div>
                      <div style={{ color: "#6b7280", lineHeight: 1.55, fontSize: 14 }}>
                        {f.desc}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-5" style={{ backgroundColor: "#e9ecef" }}>
            <div className="container-fluid">
              <Title level={2} className="text-center fw-bold mb-2">
                <QuestionCircleOutlined className="me-2" />
                Câu hỏi thường gặp
              </Title>

              <Row justify="center">
                <Col xs={24} md={20} lg={16}>
                  <div
                    ref={faqRef}
                    data-anim="animate__fadeIn"
                    data-delay="0.05s"
                    style={{
                      borderRadius: 16,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                      padding: 10,
                    }}
                  >
                    <Collapse
                      accordion
                      bordered={false}
                      items={[
                        {
                          key: "1",
                          label: "Làm thế nào để đặt sân?",
                          children: (
                            <Text style={{ color: "#4b5563" }}>
                              Người dùng chỉ cần chọn sân, chọn khung giờ phù hợp và xác nhận đặt sân trên hệ thống.
                            </Text>
                          ),
                        },
                        {
                          key: "2",
                          label: "Thanh toán online bằng cách nào?",
                          children: (
                            <Text style={{ color: "#4b5563" }}>
                              Bạn có thể nạp tiền vào tài khoản để thanh toán trực tiếp cho các lượt đặt sân một cách tiện lợi.
                            </Text>
                          ),
                        },
                        {
                          key: "3",
                          label: "Chức năng ghép đội hoạt động ra sao?",
                          children: (
                            <Text style={{ color: "#4b5563" }}>
                              Hệ thống hỗ trợ kết nối người chơi để tìm đồng đội hoặc đối thủ phù hợp cho trận đấu.
                            </Text>
                          ),
                        },
                        {
                          key: "4",
                          label: "Chatbot hỗ trợ những gì?",
                          children: (
                            <Text style={{ color: "#4b5563" }}>
                              Chatbot hỗ trợ giải đáp các thắc mắc liên quan đến đặt sân, thanh toán và sử dụng các chức năng trên hệ thống.
                            </Text>
                          ),
                        },
                      ]}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* COMMUNITY / EXPERIENCE */}
          <section className="py-5 bg-white">
            <div className="container-fluid">
              <Title level={2} className="text-center fw-bold mb-2">
                Trải nghiệm trên hệ thống
              </Title>

              <Row gutter={[24, 24]} justify="center" align="stretch">
                {community.map((c, idx) => (
                  <Col xs={24} md={8} key={idx}>
                    <Card
                      ref={setRef(100 + idx)}
                      data-anim={c.anim}
                      data-delay={`${idx * 0.08}s`}
                      hoverable
                      className="h-100 border-0 shadow-sm"
                      style={{ borderRadius: 16, background: "#f8f9fa", height: "100%" }}
                      styles={{ body: { padding: 16 } }}
                    >
                      <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ position: "relative" }}>
                          <Img
                            src={c.img}
                            alt={c.title}
                            style={{
                              width: "100%",
                              height: 170,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.50) 100%)",
                            }}
                          />
                          <div style={{ position: "absolute", left: 12, bottom: 12 }}>
                            <Tag
                              color="blue"
                              style={{ margin: 0, borderRadius: 999, padding: "2px 10px" }}
                            >
                              {c.tag}
                            </Tag>
                            <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>
                              {c.title}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Space align="center" size={10} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            background: `${c.color}14`,
                            border: `1px solid ${c.color}22`,
                          }}
                        >
                          <span style={{ fontSize: 18, color: c.color }}>{c.icon}</span>
                        </div>
                        <Text style={{ color: "#111827", fontWeight: 800 }}>
                          Tiện ích nổi bật
                        </Text>
                      </Space>

                      <div style={{ color: "#6b7280", lineHeight: 1.55, fontSize: 14 }}>
                        {c.desc}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>
        </main>
      </div>
    </UserLayout>
  );
};

export default Home;