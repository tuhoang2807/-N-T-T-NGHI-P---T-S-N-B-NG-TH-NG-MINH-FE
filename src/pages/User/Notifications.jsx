import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Tabs,
  Input,
  Select,
  Divider,
  Badge,
  Tooltip,
  Dropdown,
  Drawer,
  Skeleton,
  message,
  Empty,
} from "antd";
import {
  BellOutlined,
  CheckCircleFilled,
  InfoCircleFilled,
  WarningFilled,
  GiftFilled,
  PushpinFilled,
  PushpinOutlined,
  MoreOutlined,
  DeleteOutlined,
  CheckOutlined,
  InboxOutlined,
  RightOutlined,
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

  listItem: (unread) => ({
    borderRadius: 18,
    border: `1px solid ${unread ? "rgba(59,130,246,0.22)" : cx.soft}`,
    background: unread
      ? "linear-gradient(180deg, rgba(59,130,246,0.10), rgba(255,255,255,0.80))"
      : "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62))",
    padding: 14,
    cursor: "pointer",
    transition: "transform .14s ease, box-shadow .14s ease",
  }),

  chip: {
    borderRadius: 999,
    paddingInline: 10,
    paddingBlock: 5,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${cx.soft}`,
    background: "rgba(255,255,255,0.72)",
  },
};

const typeMeta = (type) => {
  switch (type) {
    case "success":
      return { icon: <CheckCircleFilled />, color: "green", label: "Success" };
    case "warning":
      return { icon: <WarningFilled />, color: "gold", label: "Warning" };
    case "promo":
      return { icon: <GiftFilled />, color: "magenta", label: "Promo" };
    default:
      return { icon: <InfoCircleFilled />, color: "blue", label: "Info" };
  }
};

const timeAgo = (iso) => {
  // đơn giản cho UI mock
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

export default function Notifications() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const [items, setItems] = useState(() => [
    {
      id: "n1",
      type: "info",
      title: "Cập nhật hệ thống",
      body: "Chúng tôi vừa tối ưu tốc độ tìm sân và gợi ý khung giờ tốt hơn.",
      unread: true,
      pinned: true,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "n2",
      type: "success",
      title: "Đặt sân thành công",
      body: "Đơn #A1029 đã được xác nhận. Nhấn để xem chi tiết lịch đặt.",
      unread: true,
      pinned: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "n3",
      type: "promo",
      title: "Ưu đãi cuối tuần",
      body: "Giảm 15% cho khung giờ 21:00–23:00. Số lượng có hạn.",
      unread: false,
      pinned: false,
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "n4",
      type: "warning",
      title: "Nhắc nhở thanh toán",
      body: "Bạn còn 2 giờ để hoàn tất thanh toán đơn #B2201.",
      unread: false,
      pinned: false,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const unreadCount = useMemo(
    () => items.filter((x) => x.unread).length,
    [items]
  );

  const pinnedCount = useMemo(
    () => items.filter((x) => x.pinned).length,
    [items]
  );

  const filtered = useMemo(() => {
    let arr = [...items];

    // tabs
    if (activeTab === "unread") arr = arr.filter((x) => x.unread);
    if (activeTab === "pinned") arr = arr.filter((x) => x.pinned);

    // type filter
    if (typeFilter !== "all") arr = arr.filter((x) => x.type === typeFilter);

    // search
    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.body.toLowerCase().includes(q)
      );
    }

    // sort: pinned -> newest
    arr.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return arr;
  }, [items, activeTab, search, typeFilter]);

  const openDetail = (n) => {
    setSelected(n);
    // auto mark as read when open
    if (n.unread) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    }
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((x) => ({ ...x, unread: false })));
    message.success("Đã đánh dấu tất cả là đã đọc");
  };

  const togglePin = (id) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)));
  };

  const removeOne = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSelected((cur) => (cur?.id === id ? null : cur));
    message.success("Đã xoá thông báo");
  };

  const simulateRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <OtherLayout>
      <style>{`
        .fx-item:hover { transform: translateY(-1px); box-shadow: 0 18px 50px rgba(2,6,23,.10); }
        .fx-pill { border-radius: 999px; }
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
                      <Badge count={unreadCount} overflowCount={99} offset={[6, -4]}>
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
                          <BellOutlined />
                        </div>
                      </Badge>
                      <Title level={3} style={{ margin: 0, color: "white", letterSpacing: -0.2 }}>
                        Thông báo
                      </Title>
                    </Space>
                    <Text style={{ color: "rgba(255,255,255,0.86)" }}>
                      Tập trung, rõ ràng, dễ đọc — chuẩn UI quốc tế.
                    </Text>
                  </Space>
                </Col>

                <Col>
                  <Space>
                    <Button
                      onClick={simulateRefresh}
                      style={{
                        borderRadius: 14,
                        height: 42,
                        background: "rgba(255,255,255,0.18)",
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "white",
                      }}
                    >
                      Làm mới
                    </Button>
                    <Button
                      type="primary"
                      onClick={markAllRead}
                      style={{
                        borderRadius: 14,
                        height: 42,
                        paddingInline: 16,
                        boxShadow: "0 16px 28px rgba(2,6,23,0.20)",
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
              <Row gutter={[16, 16]}>
                {/* LEFT: list */}
                <Col xs={24} lg={15}>
                  <Card style={styles.panel} bodyStyle={{ padding: 16 }}>
                    <Row gutter={[10, 10]} align="middle" justify="space-between">
                      <Col flex="auto">
                        <Tabs
                          activeKey={activeTab}
                          onChange={setActiveTab}
                          items={[
                            { key: "all", label: "Tất cả" },
                            {
                              key: "unread",
                              label: (
                                <Space size={6}>
                                  Chưa đọc <Tag className="fx-pill">{unreadCount}</Tag>
                                </Space>
                              ),
                            },
                            {
                              key: "pinned",
                              label: (
                                <Space size={6}>
                                  Đã ghim <Tag className="fx-pill">{pinnedCount}</Tag>
                                </Space>
                              ),
                            },
                          ]}
                        />
                      </Col>

                      <Col>
                        <Space wrap>
                          <Input
                            allowClear
                            placeholder="Tìm thông báo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 240, borderRadius: 14, height: 40 }}
                          />
                          <Select
                            value={typeFilter}
                            onChange={setTypeFilter}
                            style={{ width: 160 }}
                            options={[
                              { value: "all", label: "Tất cả loại" },
                              { value: "info", label: "Info" },
                              { value: "success", label: "Success" },
                              { value: "warning", label: "Warning" },
                              { value: "promo", label: "Promo" },
                            ]}
                          />
                        </Space>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "10px 0" }} />

                    {loading ? (
                      <div>
                        {[1, 2, 3].map((x) => (
                          <div key={x} style={{ marginBottom: 12 }}>
                            <Skeleton active title paragraph={{ rows: 2 }} />
                          </div>
                        ))}
                      </div>
                    ) : filtered.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo nào phù hợp."
                      />
                    ) : (
                      <Space direction="vertical" size={10} style={{ width: "100%" }}>
                        {filtered.map((n) => {
                          const meta = typeMeta(n.type);

                          const menu = {
                            items: [
                              {
                                key: "read",
                                icon: <CheckOutlined />,
                                label: "Đánh dấu đã đọc",
                                onClick: () =>
                                  setItems((prev) =>
                                    prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                                  ),
                              },
                              {
                                key: "pin",
                                icon: n.pinned ? <PushpinFilled /> : <PushpinOutlined />,
                                label: n.pinned ? "Bỏ ghim" : "Ghim",
                                onClick: () => togglePin(n.id),
                              },
                              {
                                key: "delete",
                                icon: <DeleteOutlined />,
                                label: "Xoá",
                                danger: true,
                                onClick: () => removeOne(n.id),
                              },
                            ],
                          };

                          return (
                            <div
                              key={n.id}
                              className="fx-item"
                              style={styles.listItem(n.unread)}
                              onClick={() => openDetail(n)}
                            >
                              <Row align="middle" gutter={[12, 12]} wrap={false}>
                                <Col flex="none">
                                  <div style={styles.iconBox}>
                                    <span style={{ color: meta.color === "gold" ? "#b45309" : meta.color }}>
                                      {meta.icon}
                                    </span>
                                  </div>
                                </Col>

                                <Col flex="auto" style={{ minWidth: 0 }}>
                                  <Row justify="space-between" align="top" wrap={false}>
                                    <div style={{ minWidth: 0, paddingRight: 10 }}>
                                      <Space size={8} wrap>
                                        <Text
                                          strong
                                          style={{
                                            color: cx.text,
                                            fontSize: 14,
                                          }}
                                        >
                                          {n.title}
                                        </Text>
                                        {n.pinned && (
                                          <Tag color="purple" style={styles.chip}>
                                            Pinned
                                          </Tag>
                                        )}
                                        {n.unread && (
                                          <Tag color="blue" style={styles.chip}>
                                            New
                                          </Tag>
                                        )}
                                        <Tag style={styles.chip}>{meta.label}</Tag>
                                      </Space>

                                      <div
                                        style={{
                                          color: cx.sub,
                                          marginTop: 6,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                        }}
                                      >
                                        {n.body}
                                      </div>

                                      <div style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: 12, color: cx.sub }}>
                                          {timeAgo(n.createdAt)}
                                        </Text>
                                      </div>
                                    </div>

                                    <Space size={8} onClick={(e) => e.stopPropagation()}>
                                      <Tooltip title={n.pinned ? "Bỏ ghim" : "Ghim"}>
                                        <Button
                                          size="small"
                                          icon={n.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                                          onClick={() => togglePin(n.id)}
                                          style={{ borderRadius: 12 }}
                                        />
                                      </Tooltip>

                                      <Dropdown trigger={["click"]} menu={menu} placement="bottomRight">
                                        <Button size="small" icon={<MoreOutlined />} style={{ borderRadius: 12 }} />
                                      </Dropdown>

                                      <RightOutlined style={{ color: "rgba(11,18,32,0.35)" }} />
                                    </Space>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          );
                        })}
                      </Space>
                    )}
                  </Card>
                </Col>

                {/* RIGHT: preview */}
                <Col xs={24} lg={9}>
                  <Card style={styles.panel} bodyStyle={{ padding: 16 }}>
                    <Row justify="space-between" align="middle">
                      <Space>
                        <InboxOutlined />
                        <Text strong>Preview</Text>
                      </Space>
                      <Tag className="fx-pill">Click 1 item</Tag>
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    {!selected ? (
                      <div style={{ padding: "30px 0" }}>
                        <Empty description="Chọn một thông báo để xem nhanh." />
                      </div>
                    ) : (
                      <div>
                        <Space wrap size={8}>
                          <Tag color={typeMeta(selected.type).color} style={styles.chip}>
                            {typeMeta(selected.type).label}
                          </Tag>
                          {selected.pinned && (
                            <Tag color="purple" style={styles.chip}>
                              Pinned
                            </Tag>
                          )}
                        </Space>

                        <Title level={4} style={{ margin: "10px 0 6px", color: cx.text }}>
                          {selected.title}
                        </Title>
                        <Text style={{ color: cx.sub, fontSize: 12 }}>
                          {timeAgo(selected.createdAt)}
                        </Text>

                        <Divider style={{ margin: "12px 0" }} />

                        <Text style={{ color: cx.sub }}>{selected.body}</Text>

                        <Divider style={{ margin: "14px 0" }} />

                        <Space direction="vertical" size={10} style={{ width: "100%" }}>
                          <Button
                            type="primary"
                            block
                            style={{ borderRadius: 14, height: 42 }}
                            onClick={() => message.info("Hook vào điều hướng chi tiết ở đây")}
                          >
                            Đi tới chi tiết
                          </Button>
                          <Button
                            block
                            style={{ borderRadius: 14, height: 42 }}
                            icon={<DeleteOutlined />}
                            onClick={() => removeOne(selected.id)}
                          >
                            Xoá thông báo
                          </Button>
                        </Space>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </div>

        {/* Detail Drawer (mobile-friendly) */}
        <Drawer
          title="Chi tiết thông báo"
          open={false}
          onClose={() => {}}
          destroyOnClose
        />
      </div>
    </OtherLayout>
  );
}
