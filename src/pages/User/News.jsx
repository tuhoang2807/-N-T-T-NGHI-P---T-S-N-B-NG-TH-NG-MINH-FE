import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Input,
  Select,
  Divider,
  Tooltip,
  Drawer,
  Pagination,
  message,
  Empty,
} from "antd";
import {
  FireOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  StarFilled,
  StarOutlined,
  RightOutlined,
  TagsOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import OtherLayout from "../../layouts/OtherLayout";
import "animate.css/animate.css";

const { Title, Text } = Typography;

const cx = {
  text: "#0B1220",
  sub: "rgba(11, 18, 32, 0.62)",
  line: "rgba(11, 18, 32, 0.10)",
  soft: "rgba(11, 18, 32, 0.06)",
  glass: "rgba(255,255,255,0.72)",
  rXL: 26,
  rLG: 22,
  rMD: 18,
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "56px 14px",
    background:
      "radial-gradient(1200px 520px at 18% 4%, rgba(59,130,246,0.20), transparent 60%), radial-gradient(900px 420px at 82% 0%, rgba(236,72,153,0.14), transparent 55%), linear-gradient(180deg, #f8fafc, #eef2ff 55%, #f8fafc)",
  },
  wrap: { maxWidth: 1200, margin: "0 auto" },

  shell: {
    borderRadius: cx.rXL,
    border: `1px solid ${cx.line}`,
    background: cx.glass,
    backdropFilter: "blur(14px)",
    overflow: "hidden",
    boxShadow: "0 30px 120px rgba(2,6,23,.12)",
  },

  hero: {
    padding: 22,
    background:
      "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(99,102,241,0.88), rgba(236,72,153,0.74))",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(560px 240px at 18% 35%, rgba(255,255,255,0.32), transparent 60%), radial-gradient(720px 280px at 78% 15%, rgba(255,255,255,0.18), transparent 65%)",
    pointerEvents: "none",
  },

  content: { padding: 18 },

  panel: {
    borderRadius: cx.rLG,
    border: `1px solid ${cx.line}`,
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 60px rgba(2,6,23,.08)",
  },

  featured: {
    borderRadius: cx.rLG,
    border: `1px solid rgba(59,130,246,0.18)`,
    background:
      "linear-gradient(180deg, rgba(59,130,246,0.10), rgba(255,255,255,0.80))",
    padding: 16,
    cursor: "pointer",
    transition: "transform .14s ease, box-shadow .14s ease",
  },

  newsCard: {
    borderRadius: cx.rMD,
    border: `1px solid ${cx.soft}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62))",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform .14s ease, box-shadow .14s ease",
    height: "100%",
  },

  thumb: (seed) => ({
    height: 140,
    background:
      seed === "hot"
        ? "linear-gradient(120deg, rgba(59,130,246,0.75), rgba(236,72,153,0.55))"
        : "linear-gradient(120deg, rgba(99,102,241,0.70), rgba(56,189,248,0.55))",
    position: "relative",
  }),
  thumbGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(320px 120px at 20% 35%, rgba(255,255,255,0.26), transparent 55%), radial-gradient(260px 120px at 85% 10%, rgba(255,255,255,0.18), transparent 60%)",
    pointerEvents: "none",
  },

  chip: { borderRadius: 999, paddingInline: 10, paddingBlock: 5 },
};

const ago = (iso) => {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  return `${days} ngày trước`;
};

export default function News() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("new");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [saved, setSaved] = useState(() => new Set(["a2"]));

  const data = useMemo(
    () => [
      {
        id: "a1",
        badge: "Hot",
        category: "Sự kiện",
        title: "Giải đấu cuối tuần: đăng ký đội ngay",
        desc: "Mở đăng ký giải đấu 5v5 & 7v7. Có thưởng + quà tài trợ.",
        content:
          "Chi tiết giải đấu: thể thức, lịch thi đấu, phí tham gia, và quy định trọng tài...",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        seed: "hot",
      },
      {
        id: "a2",
        badge: "Update",
        category: "Sản phẩm",
        title: "Tính năng ghép đội thông minh đã nâng cấp",
        desc: "AI gợi ý kèo phù hợp hơn, giảm lệch trình và ưu tiên vị trí.",
        content:
          "Bản nâng cấp tập trung vào trải nghiệm ghép đội: lọc theo vị trí, level, lịch sử chơi...",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        seed: "normal",
      },
      {
        id: "a3",
        badge: "Tips",
        category: "Kinh nghiệm",
        title: "5 mẹo chọn khung giờ đá sân đẹp và ít kẹt",
        desc: "Tối ưu việc đặt sân: tránh giờ cao điểm, chọn sân theo độ hot.",
        content:
          "Mẹo 1: xem lịch heatmap... Mẹo 2: đặt trước 2-3 ngày... ",
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        seed: "normal",
      },
      {
        id: "a4",
        badge: "Notice",
        category: "Thông báo",
        title: "Bảo trì hệ thống lúc 02:00 sáng",
        desc: "Thời gian bảo trì dự kiến 30 phút. Bạn vẫn xem sân được.",
        content:
          "Trong thời gian bảo trì, một số thao tác thanh toán có thể bị gián đoạn.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        seed: "normal",
      },
      {
        id: "a5",
        badge: "Hot",
        category: "Sự kiện",
        title: "Ưu đãi đêm: giảm 10% khung 21:00–23:00",
        desc: "Áp dụng một số sân hot. Số lượng voucher giới hạn.",
        content:
          "Điều kiện áp dụng: voucher chỉ dùng cho đơn tối thiểu..., không áp dụng đồng thời...",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        seed: "hot",
      },
      {
        id: "a6",
        badge: "Update",
        category: "Sản phẩm",
        title: "Trang hồ sơ mới: nhìn sang và mượt hơn",
        desc: "Cải thiện UI/UX toàn bộ trang profile + tối ưu mobile.",
        content:
          "Chúng tôi làm lại layout, spacing, typography và thêm một số action nhanh.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        seed: "normal",
      },
      {
        id: "a7",
        badge: "Tips",
        category: "Kinh nghiệm",
        title: "Cách chọn sân 5 người vs 7 người để đá đã",
        desc: "Gợi ý kích thước, đội hình, nhịp trận theo từng loại sân.",
        content:
          "Sân 5: tốc độ cao, chơi 1-2 chạm... Sân 7: cần độ bền, kỷ luật vị trí...",
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        seed: "normal",
      },
    ],
    []
  );

  const categories = useMemo(() => {
    const set = new Set(data.map((x) => x.category));
    return ["all", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    let arr = [...data];

    if (cat !== "all") arr = arr.filter((x) => x.category === cat);

    const s = q.trim().toLowerCase();
    if (s) {
      arr = arr.filter(
        (x) =>
          x.title.toLowerCase().includes(s) ||
          x.desc.toLowerCase().includes(s) ||
          x.content.toLowerCase().includes(s)
      );
    }

    if (sort === "new") {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "hot") {
      arr.sort((a, b) => (b.badge === "Hot") - (a.badge === "Hot"));
    }

    return arr;
  }, [data, cat, q, sort]);

  const featured = filtered[0];

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openArticle = (item) => {
    setActive(item);
    setOpen(true);
  };

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    message.success("Đã cập nhật mục đã lưu");
  };

  return (
    <OtherLayout>
      <style>{`
        .fx-hover:hover { transform: translateY(-1px); box-shadow: 0 18px 50px rgba(2,6,23,.10); }
        .fx-line { border-color: rgba(11,18,32,0.10)!important; }
      `}</style>

      <div style={styles.page}>
        <div style={styles.wrap}>
          <Card className="animate__animated animate__fadeIn" style={styles.shell} bodyStyle={{ padding: 0 }}>
            {/* HERO */}
            <div style={styles.hero}>
              <div style={styles.heroGlow} />
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col>
                  <Space direction="vertical" size={6}>
                    <Space size={10} align="center">
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          background: "rgba(255,255,255,0.16)",
                          border: "1px solid rgba(255,255,255,0.35)",
                          color: "white",
                        }}
                      >
                        <FireOutlined />
                      </div>
                      <Title level={3} style={{ margin: 0, color: "white", letterSpacing: -0.2 }}>
                        Tin tức
                      </Title>
                    </Space>
                    <Text style={{ color: "rgba(255,255,255,0.86)" }}>
                      Cập nhật sản phẩm • Giải đấu • Ưu đãi • Kinh nghiệm
                    </Text>
                  </Space>
                </Col>

                <Col>
                  <Space wrap>
                    <Input
                      allowClear
                      value={q}
                      onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                      }}
                      prefix={<SearchOutlined />}
                      placeholder="Tìm bài viết..."
                      style={{
                        width: 280,
                        borderRadius: 14,
                        height: 42,
                        background: "rgba(255,255,255,0.94)",
                      }}
                    />
                    <Select
                      value={cat}
                      onChange={(v) => {
                        setCat(v);
                        setPage(1);
                      }}
                      style={{ width: 160 }}
                      options={categories.map((c) => ({
                        value: c,
                        label: c === "all" ? "Tất cả chủ đề" : c,
                      }))}
                    />
                    <Select
                      value={sort}
                      onChange={setSort}
                      style={{ width: 150 }}
                      options={[
                        { value: "new", label: "Mới nhất" },
                        { value: "hot", label: "Ưu tiên Hot" },
                      ]}
                    />
                  </Space>
                </Col>
              </Row>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
              <Row gutter={[16, 16]}>
                {/* Featured */}
                <Col xs={24}>
                  <Card style={styles.panel} bodyStyle={{ padding: 16 }}>
                    {!featured ? (
                      <Empty description="Chưa có bài viết." />
                    ) : (
                      <div
                        className="fx-hover"
                        style={styles.featured}
                        onClick={() => openArticle(featured)}
                      >
                        <Row gutter={[14, 14]} align="middle">
                          <Col xs={24} md={9}>
                            <div style={{ ...styles.thumb(featured.seed), borderRadius: 18 }}>
                              <div style={styles.thumbGlow} />
                            </div>
                          </Col>

                          <Col xs={24} md={15}>
                            <Space wrap size={8}>
                              <Tag color={featured.badge === "Hot" ? "red" : "blue"} style={styles.chip}>
                                {featured.badge}
                              </Tag>
                              <Tag style={styles.chip} icon={<TagsOutlined />}>
                                {featured.category}
                              </Tag>
                              <Tag style={styles.chip} icon={<ClockCircleOutlined />}>
                                {ago(featured.createdAt)}
                              </Tag>
                            </Space>

                            <Title level={4} style={{ margin: "10px 0 6px", color: cx.text }}>
                              {featured.title}
                            </Title>
                            <Text style={{ color: cx.sub }}>{featured.desc}</Text>

                            <Divider className="fx-line" style={{ margin: "14px 0" }} />

                            <Row justify="space-between" align="middle">
                              <Space size={8}>
                                <Tag color="gold" style={styles.chip} icon={<TrophyOutlined />}>
                                  Featured
                                </Tag>
                                <Tag color="blue" style={styles.chip} icon={<ThunderboltOutlined />}>
                                  Recommended
                                </Tag>
                              </Space>

                              <Space size={10} onClick={(e) => e.stopPropagation()}>
                                <Tooltip title={saved.has(featured.id) ? "Bỏ lưu" : "Lưu bài"}>
                                  <Button
                                    icon={saved.has(featured.id) ? <StarFilled /> : <StarOutlined />}
                                    onClick={() => toggleSave(featured.id)}
                                    style={{ borderRadius: 14 }}
                                  />
                                </Tooltip>
                                <Button
                                  type="primary"
                                  icon={<RightOutlined />}
                                  onClick={() => openArticle(featured)}
                                  style={{ borderRadius: 14 }}
                                >
                                  Đọc ngay
                                </Button>
                              </Space>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* List grid */}
                <Col xs={24}>
                  <Card style={styles.panel} bodyStyle={{ padding: 16 }}>
                    <Row justify="space-between" align="middle">
                      <Space>
                        <InfoCircleOutlined />
                        <Text strong>Danh sách bài viết</Text>
                      </Space>
                      <Text style={{ color: cx.sub, fontSize: 12 }}>
                        {filtered.length} bài
                      </Text>
                    </Row>

                    <Divider className="fx-line" style={{ margin: "12px 0" }} />

                    {filtered.length === 0 ? (
                      <Empty description="Không có bài viết phù hợp." />
                    ) : (
                      <>
                        <Row gutter={[12, 12]}>
                          {pageItems.map((n) => (
                            <Col key={n.id} xs={24} sm={12} lg={8}>
                              <Card
                                className="fx-hover"
                                style={styles.newsCard}
                                bodyStyle={{ padding: 14 }}
                                onClick={() => openArticle(n)}
                              >
                                <div style={{ ...styles.thumb(n.seed), borderRadius: 16, marginBottom: 12 }}>
                                  <div style={styles.thumbGlow} />
                                </div>

                                <Space wrap size={8}>
                                  <Tag color={n.badge === "Hot" ? "red" : "blue"} style={styles.chip}>
                                    {n.badge}
                                  </Tag>
                                  <Tag style={styles.chip}>{n.category}</Tag>
                                  <Tag style={styles.chip} icon={<ClockCircleOutlined />}>
                                    {ago(n.createdAt)}
                                  </Tag>
                                </Space>

                                <div style={{ marginTop: 10 }}>
                                  <Text strong style={{ color: cx.text, fontSize: 14 }}>
                                    {n.title}
                                  </Text>
                                  <div style={{ marginTop: 6, color: cx.sub }}>
                                    {n.desc}
                                  </div>
                                </div>

                                <Divider className="fx-line" style={{ margin: "12px 0" }} />

                                <Row justify="space-between" align="middle" onClick={(e) => e.stopPropagation()}>
                                  <Tooltip title={saved.has(n.id) ? "Bỏ lưu" : "Lưu bài"}>
                                    <Button
                                      icon={saved.has(n.id) ? <StarFilled /> : <StarOutlined />}
                                      onClick={() => toggleSave(n.id)}
                                      style={{ borderRadius: 14 }}
                                    />
                                  </Tooltip>
                                  <Button
                                    type="primary"
                                    icon={<RightOutlined />}
                                    onClick={() => openArticle(n)}
                                    style={{ borderRadius: 14 }}
                                  >
                                    Đọc
                                  </Button>
                                </Row>
                              </Card>
                            </Col>
                          ))}
                        </Row>

                        <Divider className="fx-line" style={{ margin: "14px 0" }} />

                        <Row justify="end">
                          <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={filtered.length}
                            onChange={setPage}
                            showSizeChanger={false}
                          />
                        </Row>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Drawer đọc chi tiết */}
          <Drawer
            title="Bài viết"
            open={open}
            onClose={() => setOpen(false)}
            width={520}
            destroyOnClose
          >
            {!active ? (
              <Empty />
            ) : (
              <div>
                <Space wrap size={8}>
                  <Tag color={active.badge === "Hot" ? "red" : "blue"} style={styles.chip}>
                    {active.badge}
                  </Tag>
                  <Tag style={styles.chip} icon={<TagsOutlined />}>
                    {active.category}
                  </Tag>
                  <Tag style={styles.chip} icon={<ClockCircleOutlined />}>
                    {ago(active.createdAt)}
                  </Tag>
                </Space>

                <Title level={4} style={{ margin: "10px 0 6px", color: cx.text }}>
                  {active.title}
                </Title>
                <Text style={{ color: cx.sub }}>{active.desc}</Text>

                <Divider className="fx-line" style={{ margin: "14px 0" }} />

                <Text style={{ color: cx.sub }}>{active.content}</Text>

                <Divider className="fx-line" style={{ margin: "14px 0" }} />

                <Row justify="space-between" align="middle">
                  <Button
                    icon={saved.has(active.id) ? <StarFilled /> : <StarOutlined />}
                    onClick={() => toggleSave(active.id)}
                    style={{ borderRadius: 14 }}
                  >
                    {saved.has(active.id) ? "Đã lưu" : "Lưu bài"}
                  </Button>

                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    style={{ borderRadius: 14 }}
                    onClick={() => message.info("Hook vào điều hướng /news/:id ở đây")}
                  >
                    Đi tới trang chi tiết
                  </Button>
                </Row>
              </div>
            )}
          </Drawer>
        </div>
      </div>
    </OtherLayout>
  );
}
