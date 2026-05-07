import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtherLayout from "../../layouts/OtherLayout";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  Button,
  Radio,
  message,
  Spin,
  Empty,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { bookingApi } from "../../services/api/booking.api";
import { fieldApi } from "../../services/api/filed.api";
import { fieldSlotApi } from "../../services/api/fieldslot.api";
import { fieldServiceApi } from "../../services/api/field_service.api";
import { userApi } from "../../services/api/user.api";

const { Title, Text } = Typography;

const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

const typeLabel = (t) => {
  if (t === "FIVE") return "Sân 5";
  if (t === "SEVEN") return "Sân 7";
  if (t === "ELEVEN") return "Sân 11";
  return t || "—";
};

const formatDateLabel = (isoDate) => {
  try {
    const d = new Date(`${isoDate}T00:00:00`);
    const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
    const day = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${weekday} • ${day}`;
  } catch {
    return isoDate || "—";
  }
};

const hhmm = (t) => (t ? String(t).slice(0, 5) : "");
const endLabel = (t) => {
  if (!t) return "";
  if (String(t) === "23:59:59") return "24:00";
  return hhmm(t);
};

const getAuthPack = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function BookingPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    bookingId: bookingIdFromState,
    bookingData,
    userId: userIdFromState,
    fieldId,
    slotId,
    date,
    serviceIds,
    couponCode,
  } = location.state || {};

  const fieldIdNum = Number(fieldId);
  const slotIdNum = Number(slotId);

  const [loading, setLoading] = useState(false);
  const [fieldInfo, setFieldInfo] = useState(null);
  const [pickedSlot, setPickedSlot] = useState(null);

  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesData, setServicesData] = useState([]);

  const [booking, setBooking] = useState(bookingData || null);
  const bookingId = bookingIdFromState || booking?.bookingId;

  const [payMethod, setPayMethod] = useState("COIN");
  const [paying, setPaying] = useState(false);

  const authPack = useMemo(() => getAuthPack(), []);
  const authUser = authPack?.user || null;
  const effectiveUserId = Number(userIdFromState ?? authUser?.userId ?? 0);

  const [coin, setCoin] = useState(0);
  const [loadingCoin, setLoadingCoin] = useState(false);

  const fetchCoin = async () => {
    if (!effectiveUserId) return 0;

    setLoadingCoin(true);
    try {
      const res = await userApi.getCoins(effectiveUserId);

      const coinValue =
        res?.data?.data?.data ??
        res?.data?.data ??
        res?.data ??
        0;

      const n = Number(coinValue ?? 0);
      setCoin(Number.isFinite(n) ? n : 0);
      return Number.isFinite(n) ? n : 0;
    } catch (e) {
      const apiMsg = e?.response?.data?.message || e?.message;
      message.error(apiMsg || "Không lấy được số dư coin");
      setCoin(0);
      return 0;
    } finally {
      setLoadingCoin(false);
    }
  };

  useEffect(() => {
    fetchCoin();
  }, [effectiveUserId]);

  useEffect(() => {
    const run = async () => {
      if (!fieldIdNum || !slotIdNum || !date) return;
      setLoading(true);
      try {
        const [fieldRes, slotRes] = await Promise.all([
          fieldApi.getById(fieldIdNum),
          fieldSlotApi.getAll(),
        ]);

        setFieldInfo(fieldRes?.data?.data || null);

        const slots = slotRes?.data?.data || [];
        const found = (Array.isArray(slots) ? slots : []).find(
          (x) => Number(x.slotId) === slotIdNum
        );

        if (found) {
          setPickedSlot({
            slotId: found.slotId,
            slotNumber: found.slotNumber,
            start: found.slotStart,
            end: found.slotEnd,
            label: `${hhmm(found.slotStart)} - ${endLabel(found.slotEnd)}`,
            price: Number(found.price || 0),
            isPeak: !!found.isPeak,
          });
        } else {
          setPickedSlot(null);
        }
      } catch (e) {
        message.error("Không tải được thông tin sân/slot");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [fieldIdNum, slotIdNum, date]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fieldServiceApi.getAll();
        const raw = res?.data?.data ?? res?.data ?? [];
        setServicesData(Array.isArray(raw) ? raw : []);
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.message;
        message.error(apiMsg || "Không tải được danh sách dịch vụ");
        setServicesData([]);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const selectedServices = useMemo(() => {
    const ids = (serviceIds || []).map((x) => Number(x));
    const idSet = new Set(ids);
    return (servicesData || [])
      .filter((s) => idSet.has(Number(s?.serviceId)))
      .map((s) => ({
        id: s?.serviceId,
        name: s?.serviceName,
        price: Number(s?.price || 0),
      }));
  }, [servicesData, serviceIds]);

  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  }, [selectedServices]);

  useEffect(() => {
    const runCreate = async () => {
      if (bookingIdFromState) return;
      if (!effectiveUserId || !fieldIdNum || !slotIdNum || !date) return;
      if (booking?.bookingId) return;

      try {
        setLoading(true);

        const payload = {
          userId: Number(effectiveUserId),
          fieldId: Number(fieldIdNum),
          slotId: Number(slotIdNum),
          bookingDate: date,
          serviceIds: (serviceIds || []).map((x) => Number(x)),
          couponCode: couponCode || "",
        };

        const createRes = await bookingApi.create(payload);
        const created = createRes?.data?.data;

        if (!created?.bookingId) {
          message.error("Tạo booking thất bại (không nhận bookingId)");
          return;
        }

        setBooking(created);

        message.success(
          `Tạo đơn thành công! Booking #${created.bookingId} • Hạn cọc: ${
            created.depositDueAt
              ? new Date(created.depositDueAt).toLocaleString("vi-VN")
              : "—"
          }`
        );
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.message;
        message.error(apiMsg || "Tạo booking thất bại");
      } finally {
        setLoading(false);
      }
    };

    runCreate();
  }, [bookingIdFromState, effectiveUserId, fieldIdNum, slotIdNum, date, booking, serviceIds, couponCode]);

  const fieldPrice = Number(booking?.fieldPrice ?? pickedSlot?.price ?? 0);
  const depositAmount = Number(booking?.depositAmount ?? Math.round(fieldPrice * 0.3));
  const totalPrice = Number(booking?.totalPrice ?? fieldPrice + servicesTotal);

  const notEnoughCoin = payMethod === "COIN" && coin < depositAmount;

  const depositDueAtText = useMemo(() => {
    const t = booking?.depositDueAt;
    if (!t) return "—";
    try {
      return new Date(t).toLocaleString("vi-VN");
    } catch {
      return String(t);
    }
  }, [booking?.depositDueAt]);

  const heroImage =
    fieldInfo?.imageUrl && String(fieldInfo.imageUrl).trim()
      ? fieldInfo.imageUrl
      : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80";

  const onPayDeposit = async () => {
    if (!bookingId) {
      message.error("Chưa có bookingId (đợi tạo đơn xong)");
      return;
    }

    if (payMethod === "ONLINE") {
      message.info("Thanh toán online chưa triển khai BE. Tạm thời chọn Coin để test.");
      return;
    }

    const latestCoin = await fetchCoin();
    if (latestCoin < depositAmount) {
      message.warning("Không đủ coin. Vui lòng nạp thêm coin để thanh toán đặt cọc.");
      return;
    }

    try {
      setPaying(true);
      await bookingApi.deposit(bookingId);
      message.success(`Cọc thành công cho Booking #${bookingId} • ${formatVND(depositAmount)}`);

      await fetchCoin();

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (e) {
      const apiMsg = e?.response?.data?.message || e?.message;
      message.error(apiMsg || "Thanh toán thất bại");
    } finally {
      setPaying(false);
    }
  };

  const missingData = !effectiveUserId || !fieldIdNum || !slotIdNum || !date;

  return (
    <OtherLayout>
      <div
        style={{
          minHeight: "100vh",
          padding: "26px 14px",
          background: "linear-gradient(180deg, #f8fafc, #eef2ff 55%, #f8fafc)",
        }}
      >
        <style>{`
          .glass-card {
            border-radius: 18px !important;
            border: 1px solid rgba(255,255,255,0.55) !important;
            background: rgba(255,255,255,0.72) !important;
            backdrop-filter: blur(14px);
          }
        `}</style>

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Space style={{ marginBottom: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: 14, height: 40, fontWeight: 800 }}
            >
              Quay lại
            </Button>
          </Space>

          {missingData ? (
            <Card className="glass-card" styles={{ body: { padding: 18 } }}>
              <Empty description="Thiếu dữ liệu. Hãy đi từ trang Confirm sang." />
            </Card>
          ) : (
            <Card className="glass-card" styles={{ body: { padding: 0 } }}>
              <div style={{ position: "relative" }}>
                <img
                  src={heroImage}
                  alt="invoice"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80";
                  }}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                  }}
                  referrerPolicy="no-referrer"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.62) 100%)",
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                  }}
                />
                <div style={{ position: "absolute", left: 18, bottom: 14, right: 18 }}>
                  <Space direction="vertical" size={6}>
                    <Space wrap>
                      <Tag color="purple" style={{ borderRadius: 999, fontWeight: 800 }}>
                        Hóa đơn / Thanh toán
                      </Tag>
                      {pickedSlot?.isPeak && (
                        <Tag
                          color="red"
                          icon={<ThunderboltOutlined />}
                          style={{ borderRadius: 999, fontWeight: 800 }}
                        >
                          Peak
                        </Tag>
                      )}
                      <Tag color="blue" style={{ borderRadius: 999, fontWeight: 800 }}>
                        {bookingId ? `Booking #${bookingId}` : "Đang tạo booking..."}
                      </Tag>
                    </Space>

                    <Title level={3} style={{ margin: 0, color: "white", fontWeight: 900 }}>
                      {fieldInfo?.fieldName || "—"}
                    </Title>

                    <Text style={{ color: "rgba(255,255,255,0.82)" }}>
                      {date ? `${formatDateLabel(date)} • ` : ""}
                      {pickedSlot?.label || "—"}
                    </Text>
                  </Space>
                </div>
              </div>

              <div style={{ padding: 18 }}>
                {loading ? (
                  <div style={{ padding: "18px 0", textAlign: "center" }}>
                    <Spin />
                    <div style={{ height: 8 }} />
                    <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                      Đang tải / tạo đơn...
                    </Text>
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={15}>
                      <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                        <Space align="center" size={10}>
                          <SafetyCertificateOutlined />
                          <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                            Chi tiết đặt sân
                          </Title>
                        </Space>

                        <Divider style={{ margin: "12px 0" }} />

                        <Space direction="vertical" size={10} style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Loại sân</Text>
                            <Text strong>{typeLabel(fieldInfo?.type)}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Sân</Text>
                            <Text strong>{fieldInfo?.fieldName || "—"}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Ngày</Text>
                            <Text strong>{date ? formatDateLabel(date) : "—"}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Khung giờ</Text>
                            <Text strong>{pickedSlot?.label || "—"}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Hạn cọc (20 phút)</Text>
                            <Text strong>{depositDueAtText}</Text>
                          </div>
                        </Space>
                      </Card>

                      <div style={{ height: 14 }} />

                      <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                        <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                          Dịch vụ đã chọn
                        </Title>
                        <Divider style={{ margin: "12px 0" }} />

                        {loadingServices ? (
                          <Space>
                            <Spin size="small" />
                            <Text>Đang tải dịch vụ...</Text>
                          </Space>
                        ) : selectedServices.length === 0 ? (
                          <Empty description="Không chọn dịch vụ thêm" />
                        ) : (
                          <List
                            dataSource={selectedServices}
                            renderItem={(s) => (
                              <List.Item>
                                <Space
                                  style={{
                                    width: "100%",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Text strong>{s.name}</Text>
                                  <Text>{formatVND(s.price)}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        )}

                        <Divider style={{ margin: "12px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text strong>Tổng dịch vụ</Text>
                          <Text strong>{formatVND(servicesTotal)}</Text>
                        </div>

                        {couponCode ? (
                          <>
                            <div style={{ height: 8 }} />
                            <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                              Mã giảm giá: <b>{couponCode}</b>
                            </Text>
                          </>
                        ) : null}
                      </Card>
                    </Col>

                    <Col xs={24} lg={9}>
                      <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                        <Space align="center" size={10}>
                          <CreditCardOutlined />
                          <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                            Thanh toán
                          </Title>
                        </Space>

                        <Divider style={{ margin: "12px 0" }} />

                        <Space direction="vertical" size={10} style={{ width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Giá sân</Text>
                            <Text strong>{formatVND(fieldPrice)}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Dịch vụ</Text>
                            <Text strong>{formatVND(servicesTotal)}</Text>
                          </div>

                          <Divider style={{ margin: "10px 0" }} />

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text strong style={{ fontSize: 16 }}>
                              Tổng tiền
                            </Text>
                            <Text strong style={{ fontSize: 16 }}>
                              {formatVND(totalPrice)}
                            </Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text strong>Cọc (30% tiền sân)</Text>
                            <Text strong>{formatVND(depositAmount)}</Text>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Text>Coin hiện có</Text>
                            <Text strong>
                              {loadingCoin ? <Spin size="small" /> : formatVND(coin)}
                            </Text>
                          </div>

                          {notEnoughCoin ? (
                            <Text style={{ color: "rgba(220,38,38,1)", fontWeight: 900 }}>
                              Không đủ coin để đặt cọc. Hãy nạp thêm coin.
                            </Text>
                          ) : null}

                          <Divider style={{ margin: "10px 0" }} />

                          <div>
                            <Text strong>Phương thức</Text>
                            <div style={{ height: 8 }} />
                            <Radio.Group
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value)}
                              style={{ width: "100%" }}
                            >
                              <Space direction="vertical">
                                <Radio value="COIN">Coin trong hệ thống</Radio>
                                <Radio value="ONLINE">Thanh toán online</Radio>
                              </Space>
                            </Radio.Group>
                          </div>

                          <Button
                            type="primary"
                            block
                            loading={paying}
                            disabled={
                              paying || !bookingId || (payMethod === "COIN" && notEnoughCoin)
                            }
                            onClick={onPayDeposit}
                            style={{
                              borderRadius: 14,
                              height: 44,
                              fontWeight: 900,
                              background:
                                "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
                              border: "none",
                              boxShadow: "0 18px 45px rgba(99,102,241,0.22)",
                            }}
                          >
                            Thanh toán đặt cọc
                          </Button>

                          <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                            * Thanh toán online sẽ làm sau. Hiện tại có thể test “Coin”.
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </OtherLayout>
  );
}