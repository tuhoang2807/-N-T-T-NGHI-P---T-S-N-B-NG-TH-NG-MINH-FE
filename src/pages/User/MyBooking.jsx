import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Tag,
  Empty,
  Typography,
  Space,
  Divider,
  Tooltip,
  Dropdown,
  Statistic,
  message,
  Spin,
  Modal,
  Descriptions,
  List,
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CloseOutlined,
  CreditCardOutlined,
  EyeOutlined,
  StopOutlined,
  StarOutlined,
  FileTextOutlined,
  ShopOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "animate.css/animate.css";
import OtherLayout from "../../layouts/OtherLayout";
import { useNavigate } from "react-router-dom";
import { bookingApi } from "../../services/api/booking.api";

const { Title, Text } = Typography;

const AUTH_KEY = "auth";

const TOK = {
  text: "#0B1220",
  sub: "rgba(11, 18, 32, 0.62)",
  line: "rgba(11, 18, 32, 0.12)",
  soft: "rgba(11, 18, 32, 0.08)",
  rXL: 22,
  rLG: 18,
  rMD: 14,
  shadow: "0 18px 60px rgba(2,6,23,0.08)",
  shadow2: "0 10px 28px rgba(2,6,23,0.06)",
};

const safeMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra";

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "₫";

const formatBookingDate = (value) => {
  if (!value) return "—";

  if (typeof value === "string") {
    const onlyDate = value.slice(0, 10);
    const m = onlyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mm, dd] = m;
      return `${dd}/${mm}/${y}`;
    }
  }

  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(value);
  }
};

const typeLabel = (t) => {
  if (t === "FIVE") return "Sân 5";
  if (t === "SEVEN") return "Sân 7";
  if (t === "ELEVEN") return "Sân 11";
  return t || "—";
};

const statusToVi = (st) => {
  const map = {
    PENDING_DEPOSIT: "Chờ Thanh Toán",
    DEPOSITED: "Đã Cọc",
    CHECKED_IN: "Đã Check-in",
    COMPLETED: "Hoàn Thành",
    CANCELLED: "Đã Hủy",
    EXPIRED: "Hết Hạn",
  };
  return map[st] || st || "—";
};

const statusConfig = {
  "Chờ Thanh Toán": { color: "gold", icon: <ClockCircleOutlined /> },
  "Đã Cọc": { color: "blue", icon: <CreditCardOutlined /> },
  "Đã Check-in": { color: "cyan", icon: <CalendarOutlined /> },
  "Hoàn Thành": { color: "green", icon: <CalendarOutlined /> },
  "Đã Hủy": { color: "red", icon: <CloseOutlined /> },
  "Hết Hạn": { color: "volcano", icon: <CloseOutlined /> },
};

const actionConfig = (label) => {
  const map = {
    "Thanh Toán": { type: "primary", icon: <CreditCardOutlined /> },
    "Hủy": { danger: true, icon: <StopOutlined /> },
    "Xem Chi Tiết": { icon: <EyeOutlined /> },
    "Xem Vé": { icon: <EyeOutlined /> },
    "Thêm Dịch Vụ": { icon: <ShopOutlined /> },
    "Đánh Giá": { icon: <StarOutlined /> },
    "Xem Hóa Đơn": { icon: <FileTextOutlined /> },
    "Hoàn Tiền": { danger: true, icon: <CreditCardOutlined /> },
    "Lý Do": { icon: <EyeOutlined /> },
  };
  return map[label] || {};
};

const getBookingServices = (raw) => {
  if (Array.isArray(raw?.services)) {
    return raw.services.map((s) => ({
      name: s?.serviceName || s?.name || "Dịch vụ",
      price: Number(s?.price || 0),
    }));
  }

  if (Array.isArray(raw?.bookingServices)) {
    return raw.bookingServices.map((s) => ({
      name: s?.serviceName || s?.name || "Dịch vụ",
      price: Number(s?.price || 0),
    }));
  }

  if (Array.isArray(raw?.serviceNames)) {
    return raw.serviceNames.map((name) => ({
      name,
      price: 0,
    }));
  }

  return [];
};

const IconBadge = ({ icon }) => (
  <div
    style={{
      width: 44,
      height: 44,
      borderRadius: 16,
      display: "grid",
      placeItems: "center",
      border: `1px solid ${TOK.soft}`,
      background: "linear-gradient(180deg, #ffffff, #f8fafc)",
      boxShadow: "0 10px 22px rgba(2,6,23,0.05)",
      flex: "none",
    }}
  >
    {icon}
  </div>
);

const Money = ({ children }) => (
  <span style={{ fontSize: 18, fontWeight: 800, color: TOK.text }}>
    {children}
  </span>
);

const SummaryCard = ({ title, value, prefix, hint }) => (
  <Card
    style={{
      borderRadius: TOK.rXL,
      border: `1px solid ${TOK.soft}`,
      boxShadow: TOK.shadow2,
      background: "#fff",
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Statistic title={title} value={value} prefix={prefix} />
    <Text style={{ color: TOK.sub, fontSize: 12 }}>{hint}</Text>
  </Card>
);

const MyBooking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const userId = useMemo(() => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
      return auth?.user?.userId ?? auth?.userId ?? auth?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const fetchHistory = async () => {
    if (!userId) {
      message.error("Bạn chưa đăng nhập");
      return;
    }
    setLoading(true);
    try {
      const res = await bookingApi.getHistory(userId, { page: 0, size: 200 });
      const p = res?.data?.data;
      const content = p?.content ?? p ?? [];
      setItems(Array.isArray(content) ? content : []);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const mapped = useMemo(() => {
    return (items || []).map((b) => {
      const stVi = statusToVi(b.status);

      const dateStr = formatBookingDate(b.bookingDate);
      const start = b.slotStart ? String(b.slotStart).slice(0, 5) : "—";
      const end = b.slotEnd ? String(b.slotEnd).slice(0, 5) : "—";

      let actions = ["Xem Chi Tiết"];
      if (b.status === "PENDING_DEPOSIT") {
        actions = ["Thanh Toán", "Hủy", "Xem Chi Tiết"];
      } else if (b.status === "DEPOSITED") {
        actions = ["Xem Vé", "Thêm Dịch Vụ", "Xem Chi Tiết"];
      } else if (b.status === "CHECKED_IN") {
        actions = ["Xem Vé", "Xem Chi Tiết"];
      } else if (b.status === "COMPLETED") {
        actions = ["Đánh Giá", "Xem Hóa Đơn", "Xem Chi Tiết"];
      } else if (b.status === "CANCELLED" || b.status === "EXPIRED") {
        actions = ["Lý Do", "Xem Chi Tiết"];
      }

      return {
        raw: b,
        id: b.bookingId,
        field: b.fieldName || `Sân #${b.fieldId ?? "—"}`,
        date: dateStr,
        time: `${start} - ${end}`,
        price: formatVND(b.totalPrice),
        status: stVi,
        actions,
      };
    });
  }, [items]);

  const bookings = useMemo(() => {
    const upcoming = mapped.filter((x) =>
      ["PENDING_DEPOSIT", "DEPOSITED", "CHECKED_IN"].includes(x.raw?.status)
    );
    const history = mapped.filter((x) => x.raw?.status === "COMPLETED");
    const canceled = mapped.filter((x) =>
      ["CANCELLED", "EXPIRED"].includes(x.raw?.status)
    );
    return { upcoming, history, canceled };
  }, [mapped]);

  const currentBookings = useMemo(
    () => bookings[activeTab] || [],
    [bookings, activeTab]
  );
  const totalCount =
    bookings.upcoming.length + bookings.history.length + bookings.canceled.length;

  const onAction = async (label, booking) => {
    const b = booking.raw;

    if (label === "Xem Chi Tiết") {
      setSelectedBooking(booking);
      setDetailOpen(true);
      return;
    }

    if (label === "Xem Vé") {
      setSelectedBooking(booking);
      setTicketOpen(true);
      return;
    }

    if (label === "Thanh Toán") {
      navigate("/booking/payment", {
        state: {
          bookingId: booking.id,
          userId,
          fieldId: b.fieldId,
          slotId: b.slotId,
          date: b.bookingDate,
          serviceIds: Array.isArray(b.serviceIds) ? b.serviceIds : [],
          couponCode: b.couponCode || "",
          bookingData: {
            bookingId: b.bookingId,
            fieldPrice: b.fieldPrice,
            totalPrice: b.totalPrice,
            depositAmount: b.depositAmount,
            depositDueAt: b.depositDueAt,
            status: b.status,
          },
        },
      });
      return;
    }

    if (label === "Hủy") {
      try {
        setLoading(true);
        await bookingApi.cancel(booking.id);
        message.success("Đã huỷ booking");
        await fetchHistory();
      } catch (err) {
        message.error(safeMsg(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (label === "Thêm Dịch Vụ") {
      setSelectedBooking(booking);
      setDetailOpen(true);
      message.info(
        "Hiện đang mở chi tiết booking. Nếu muốn thêm dịch vụ thật, cần nối thêm API cập nhật booking."
      );
      return;
    }

    if (label === "Đánh Giá") {
      message.info(
        "Chức năng đánh giá: bạn có thể nối sang modal hoặc trang đánh giá riêng"
      );
      return;
    }

    if (label === "Xem Hóa Đơn") {
      setSelectedBooking(booking);
      setDetailOpen(true);
      return;
    }

    if (label === "Lý Do") {
      setSelectedBooking(booking);
      setDetailOpen(true);
    }
  };

  const BookingCard = ({ booking }) => {
    const st = statusConfig[booking.status] || { color: "default", icon: null };

    const primaryAction = booking.actions?.[0];
    const moreActions = booking.actions?.slice(1) || [];

    const menu = {
      items: moreActions.map((label) => ({
        key: label,
        label,
        icon: actionConfig(label).icon,
        danger: !!actionConfig(label).danger,
        onClick: () => onAction(label, booking),
      })),
    };

    return (
      <div
        className="fx-card"
        style={{
          borderRadius: TOK.rXL,
          border: `1px solid rgba(11,18,32,0.12)`,
          background: "#fff",
          boxShadow: TOK.shadow2,
          padding: 14,
          marginBottom: 12,
          transition: "transform .14s ease, box-shadow .14s ease",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Row gutter={[14, 14]} align="middle">
          <Col xs={24} md={12}>
            <Space align="start" size={12} style={{ width: "100%" }}>
              <IconBadge
                icon={<CalendarOutlined style={{ fontSize: 18, color: "#2563eb" }} />}
              />

              <div style={{ minWidth: 0 }}>
                <Space size={8} wrap>
                  <Text
                    strong
                    style={{ fontSize: 15, color: TOK.text, letterSpacing: -0.2 }}
                  >
                    {booking.field}
                  </Text>

                  <Tag
                    color={st.color}
                    icon={st.icon}
                    style={{
                      borderRadius: 999,
                      padding: "4px 10px",
                      marginInlineStart: 0,
                    }}
                  >
                    {booking.status}
                  </Tag>
                </Space>

                <div style={{ marginTop: 6 }}>
                  <Text style={{ color: TOK.sub }}>
                    {booking.date} • {booking.time}
                  </Text>
                </div>

                <div style={{ marginTop: 10 }}>
                  <Text style={{ color: TOK.sub, fontSize: 12 }}>
                    Mã đơn:{" "}
                    <span style={{ color: TOK.text, fontWeight: 800 }}>
                      #{String(booking.id).padStart(6, "0")}
                    </span>
                  </Text>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={6}>
            <div
              style={{
                borderRadius: 16,
                border: `1px solid rgba(11,18,32,0.10)`,
                background: "#fff",
                padding: 12,
              }}
            >
              <div style={{ color: TOK.sub, fontSize: 12, marginBottom: 6 }}>
                Tổng tiền
              </div>
              <Money>{booking.price}</Money>
              <div style={{ color: TOK.sub, fontSize: 12, marginTop: 6 }}>
                Đã bao gồm phí đặt sân
              </div>
            </div>
          </Col>

          <Col xs={24} md={6}>
            <Row justify="end">
              <Space wrap>
                {primaryAction ? (
                  <Tooltip title={primaryAction}>
                    <Button
                      type={actionConfig(primaryAction).type}
                      danger={actionConfig(primaryAction).danger}
                      icon={actionConfig(primaryAction).icon}
                      style={{ borderRadius: 14, height: 40, paddingInline: 14 }}
                      loading={loading && primaryAction === "Hủy"}
                      onClick={() => onAction(primaryAction, booking)}
                    >
                      {primaryAction}
                    </Button>
                  </Tooltip>
                ) : null}

                {moreActions.length > 0 ? (
                  <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
                    <Button
                      icon={<MoreOutlined />}
                      style={{ borderRadius: 14, height: 40, paddingInline: 12 }}
                    >
                      Thêm
                    </Button>
                  </Dropdown>
                ) : null}
              </Space>
            </Row>

            <Row justify="end" style={{ marginTop: 10 }}>
              <Text style={{ color: TOK.sub, fontSize: 12 }}>
                Hỗ trợ: 1900-xxxx
              </Text>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const tabItems = [
    {
      key: "upcoming",
      label: (
        <Space size={8}>
          <ClockCircleOutlined />
          <span>Đang chờ</span>
          <Tag style={{ borderRadius: 999, margin: 0 }}>
            {bookings.upcoming.length}
          </Tag>
        </Space>
      ),
    },
    {
      key: "history",
      label: (
        <Space size={8}>
          <CalendarOutlined />
          <span>Lịch sử</span>
          <Tag style={{ borderRadius: 999, margin: 0 }}>
            {bookings.history.length}
          </Tag>
        </Space>
      ),
    },
    {
      key: "canceled",
      label: (
        <Space size={8}>
          <CloseOutlined />
          <span>Đã hủy</span>
          <Tag style={{ borderRadius: 999, margin: 0 }}>
            {bookings.canceled.length}
          </Tag>
        </Space>
      ),
    },
  ];

  return (
    <OtherLayout>
      <style>{`
        .fx-card:hover { transform: translateY(-1px); box-shadow: 0 18px 60px rgba(2,6,23,0.10); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff", padding: "40px 12px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div
            className="animate__animated animate__fadeInDown"
            style={{ marginBottom: 16 }}
          >
            <Row justify="space-between" align="middle" gutter={[12, 12]}>
              <Col>
                <Title
                  level={2}
                  style={{ marginBottom: 6, color: TOK.text, letterSpacing: -0.4 }}
                >
                  Đơn đặt của bạn
                </Title>
                <Text style={{ color: TOK.sub }}>
                  Quản lý thanh toán, vé, dịch vụ và lịch sử đặt sân — gọn gàng,
                  dễ nhìn.
                </Text>
              </Col>

              <Col>
                <Space>
                  <Tooltip title="Tải lại">
                    <Button
                      style={{ borderRadius: 14, height: 40, paddingInline: 14 }}
                      icon={<FileTextOutlined />}
                      onClick={fetchHistory}
                    >
                      Tải lại
                    </Button>
                  </Tooltip>

                  <Button
                    type="primary"
                    style={{
                      borderRadius: 14,
                      height: 40,
                      paddingInline: 14,
                      boxShadow: "0 14px 24px rgba(59,130,246,0.18)",
                    }}
                    icon={<CreditCardOutlined />}
                    onClick={() => navigate("/wallet/topup")}
                  >
                    Nạp xu
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          <div className="animate__animated animate__fadeIn" style={{ marginBottom: 12 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <SummaryCard
                  title="Đang chờ"
                  value={bookings.upcoming.length}
                  prefix={<ClockCircleOutlined />}
                  hint="Các đơn cần xử lý"
                />
              </Col>
              <Col xs={24} md={8}>
                <SummaryCard
                  title="Lịch sử"
                  value={bookings.history.length}
                  prefix={<CalendarOutlined />}
                  hint="Các đơn đã hoàn tất"
                />
              </Col>
              <Col xs={24} md={8}>
                <SummaryCard
                  title="Tổng đơn"
                  value={totalCount}
                  prefix={<FileTextOutlined />}
                  hint="Tính cả đã hủy"
                />
              </Col>
            </Row>
          </div>

          <Card
            className="animate__animated animate__fadeInUp"
            style={{
              borderRadius: TOK.rXL,
              border: `1px solid ${TOK.soft}`,
              boxShadow: TOK.shadow,
              background: "#f8fafc",
            }}
            bodyStyle={{ padding: 14 }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              centered={false}
              tabBarGutter={18}
              tabBarStyle={{ marginBottom: 8 }}
            />

            <Divider style={{ margin: "10px 0 14px", borderColor: TOK.soft }} />

            {loading ? (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <Spin />
              </div>
            ) : currentBookings.length > 0 ? (
              currentBookings.map((b) => <BookingCard key={b.id} booking={b} />)
            ) : (
              <Empty description="Chưa có dữ liệu" style={{ padding: "28px 0" }} />
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedBooking(null);
        }}
        footer={null}
        title="Chi tiết booking"
        width={720}
      >
        {selectedBooking ? (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Mã đơn">
                #{String(selectedBooking.id).padStart(6, "0")}
              </Descriptions.Item>
              <Descriptions.Item label="Sân">
                {selectedBooking.field}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày">
                {selectedBooking.date}
              </Descriptions.Item>
              <Descriptions.Item label="Khung giờ">
                {selectedBooking.time}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedBooking.status}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedBooking.price}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sân">
                {typeLabel(selectedBooking?.raw?.type)}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn cọc">
                {selectedBooking?.raw?.depositDueAt
                  ? new Date(selectedBooking.raw.depositDueAt).toLocaleString("vi-VN")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do">
                {selectedBooking?.raw?.expireReason || "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Dịch vụ</Title>
            {getBookingServices(selectedBooking.raw).length > 0 ? (
              <List
                size="small"
                dataSource={getBookingServices(selectedBooking.raw)}
                renderItem={(s) => (
                  <List.Item>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{s.name}</span>
                      <span>{s.price ? formatVND(s.price) : "—"}</span>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Text style={{ color: TOK.sub }}>
                Chưa có dữ liệu dịch vụ trong booking này.
              </Text>
            )}
          </>
        ) : null}
      </Modal>

      <Modal
        open={ticketOpen}
        onCancel={() => {
          setTicketOpen(false);
          setSelectedBooking(null);
        }}
        footer={[
          <Button key="close" onClick={() => setTicketOpen(false)}>
            Đóng
          </Button>,
        ]}
        title="Vé đặt sân"
        width={560}
      >
        {selectedBooking ? (
          <div
            style={{
              border: `1px solid ${TOK.line}`,
              borderRadius: 18,
              padding: 20,
              background: "#f8fafc",
            }}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                {selectedBooking.field}
              </Title>

              <Tag
                color={(statusConfig[selectedBooking.status] || {}).color || "blue"}
                style={{ borderRadius: 999, width: "fit-content" }}
              >
                {selectedBooking.status}
              </Tag>

              <div>
                <Text strong>Mã vé: </Text>
                <Text>#{String(selectedBooking.id).padStart(6, "0")}</Text>
              </div>

              <div>
                <Text strong>Ngày thi đấu: </Text>
                <Text>{selectedBooking.date}</Text>
              </div>

              <div>
                <Text strong>Khung giờ: </Text>
                <Text>{selectedBooking.time}</Text>
              </div>

              <div>
                <Text strong>Tổng tiền: </Text>
                <Text>{selectedBooking.price}</Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <Text style={{ color: TOK.sub }}>
                Vui lòng đưa mã booking này cho sân khi check-in.
              </Text>
            </Space>
          </div>
        ) : null}
      </Modal>
    </OtherLayout>
  );
};

export default MyBooking;