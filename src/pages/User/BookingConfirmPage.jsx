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
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Spin,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  GiftOutlined,
} from "@ant-design/icons";

import { fieldApi } from "../../services/api/filed.api";
import { fieldSlotApi } from "../../services/api/fieldslot.api";
import { fieldServiceApi } from "../../services/api/field_service.api";

const { Title, Text } = Typography;

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

const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

// ✅ ĐÚNG STRUCTURE BẠN CHỐT: { user: {...}, coinBalance: ... }
const getAuthPack = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function BookingConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // navigate("/booking/confirm", { state: { fieldId, date: "YYYY-MM-DD", slotId } })
  const { fieldId, date, slotId } = location.state || {};
  const fieldIdNum = Number(fieldId);
  const slotIdNum = Number(slotId);

  // =========================
  // Fetch Field + Slots
  // =========================
  const [loading, setLoading] = useState(false);
  const [fieldInfo, setFieldInfo] = useState(null);
  const [slotList, setSlotList] = useState([]);
  const [pickedSlot, setPickedSlot] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!fieldIdNum || !slotIdNum || !date) {
        message.warning("Thiếu dữ liệu đặt sân. Vui lòng chọn lại ở trang chi tiết.");
        return;
      }
      try {
        setLoading(true);

        const [fieldRes, slotRes] = await Promise.all([
          fieldApi.getById(fieldIdNum),
          fieldSlotApi.getAll(),
        ]);

        const f = fieldRes?.data?.data;
        const s = slotRes?.data?.data || [];

        setFieldInfo(f || null);
        setSlotList(Array.isArray(s) ? s : []);
      } catch (e) {
        message.error("Không tải được dữ liệu đặt sân");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [fieldIdNum, slotIdNum, date]);

  useEffect(() => {
    if (!slotIdNum || slotList.length === 0) return;
    const found = slotList.find((x) => Number(x.slotId) === slotIdNum);
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
  }, [slotIdNum, slotList]);

  // =========================
  // Form: user / team info (prefill from localStorage auth.user)
  // =========================
  const [form] = Form.useForm();

  useEffect(() => {
    const pack = getAuthPack();
    const u = pack?.user; // ✅ FIX: user
    if (!u) return;

    form.setFieldsValue({
      fullName: u.fullName || "",
      phone: u.phone || "",
      fcName: u.teamName || "",
      captainName: u.teamLeaderName || "",
    });
  }, [form]);

  // =========================
  // Services (add-on)
  // =========================
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesData, setServicesData] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fieldServiceApi.getAll();
        const raw = res?.data?.data ?? res?.data ?? [];
        setServicesData(Array.isArray(raw) ? raw : []);
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.message;
        message.error(apiMsg || "Không tải được danh sách dịch vụ thêm");
        setServicesData([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const SERVICE_CATALOG = useMemo(() => {
    return (servicesData || []).map((s) => ({
      key: s?.serviceId,
      name: s?.serviceName,
      price: Number(s?.price || 0),
    }));
  }, [servicesData]);

  const [serviceKeys, setServiceKeys] = useState([]);
  const servicesTotal = useMemo(() => {
    const map = new Map(SERVICE_CATALOG.map((s) => [Number(s.key), s]));
    return (serviceKeys || []).reduce(
      (sum, k) => sum + (map.get(Number(k))?.price || 0),
      0
    );
  }, [serviceKeys, SERVICE_CATALOG]);

  // =========================
  // Coupon (demo)
  // =========================
  const [coupon, setCoupon] = useState("");
  const basePrice = pickedSlot?.price || 0;

  const discount = useMemo(() => {
    const code = String(coupon || "").trim().toUpperCase();
    const sub = basePrice + servicesTotal;

    if (!code) return 0;
    if (code === "GIAM50K") return Math.min(50000, sub);
    if (code === "GIAM10") return Math.min(Math.round(sub * 0.1), 100000);
    return 0;
  }, [coupon, basePrice, servicesTotal]);

  const subtotal = basePrice + servicesTotal;
  const total = Math.max(0, subtotal - discount);

  // =========================
  // ✅ Confirm chỉ chuyển hướng
  // =========================
  const [submitting, setSubmitting] = useState(false);

  const onGoPayment = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await form.validateFields();

      const pack = getAuthPack();
      const u = pack?.user; // ✅ FIX: user
      if (!u?.userId) {
        message.error("Bạn chưa đăng nhập (không tìm thấy auth.user.userId)");
        return;
      }

      if (!fieldInfo || !pickedSlot || !date) {
        message.error("Thiếu thông tin sân/khung giờ");
        return;
      }

      const values = form.getFieldsValue();

      navigate("/booking/payment", {
        state: {
          userId: Number(u.userId),
          fieldId: fieldIdNum,
          slotId: slotIdNum,
          date,
          serviceIds: (serviceKeys || []).map((x) => Number(x)),
          couponCode: coupon || "",
          customerInfo: {
            fullName: values.fullName,
            phone: values.phone,
            fcName: values.fcName,
            captainName: values.captainName,
          },
        },
      });
    } catch (e) {
      const apiMsg = e?.response?.data?.message || e?.message;
      if (apiMsg) message.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const heroImage =
    fieldInfo?.imageUrl && String(fieldInfo.imageUrl).trim()
      ? fieldInfo.imageUrl
      : "https://picsum.photos/seed/booking/1400/800";

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

          <Card className="glass-card" styles={{ body: { padding: 0 } }}>
            <div style={{ position: "relative" }}>
              <img
                src={heroImage}
                alt="booking"
                onError={(e) => (e.currentTarget.src = "https://picsum.photos/seed/booking/1400/800")}
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
                    <Tag color="blue" style={{ borderRadius: 999, fontWeight: 800 }}>
                      Xác nhận đặt sân
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
              {(!fieldIdNum || !slotIdNum || !date) && (
                <Card
                  style={{
                    borderRadius: 16,
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.20)",
                  }}
                  styles={{ body: { padding: 14 } }}
                >
                  <Text strong style={{ color: "rgba(185,28,28,0.92)" }}>
                    Thiếu dữ liệu đặt sân.
                  </Text>
                  <div />
                  <Text style={{ color: "rgba(185,28,28,0.75)" }}>
                    Bạn cần vào trang chi tiết sân → chọn ngày/khung giờ → bấm “Đặt sân” để qua đây.
                  </Text>
                </Card>
              )}

              {loading ? (
                <div style={{ padding: "18px 0", textAlign: "center" }}>
                  <Spin />
                  <div style={{ height: 8 }} />
                  <Text style={{ color: "rgba(11,18,32,0.55)" }}>Đang tải dữ liệu...</Text>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={15}>
                    <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                      <Space align="center" size={10}>
                        <SafetyCertificateOutlined />
                        <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                          Thông tin đặt sân
                        </Title>
                      </Space>

                      <Divider style={{ margin: "12px 0" }} />

                      <Form layout="vertical" form={form}>
                        <Row gutter={[12, 12]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Tên người dùng"
                              name="fullName"
                              rules={[{ required: true, message: "Nhập tên người dùng" }]}
                            >
                              <Input placeholder="VD: Nguyễn Văn A" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Số điện thoại"
                              name="phone"
                              rules={[{ required: true, message: "Nhập số điện thoại" }]}
                            >
                              <Input placeholder="VD: 09xxxxxxxx" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Tên FC"
                              name="fcName"
                              rules={[{ required: true, message: "Nhập tên FC" }]}
                            >
                              <Input placeholder="VD: FC Anh Em" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Tên đội trưởng"
                              name="captainName"
                              rules={[{ required: true, message: "Nhập tên đội trưởng" }]}
                            >
                              <Input placeholder="VD: Trần B" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form>
                    </Card>

                    <div style={{ height: 14 }} />

                    <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                      <Space align="center" size={10}>
                        <ThunderboltOutlined />
                        <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                          Dịch vụ thêm
                        </Title>
                      </Space>

                      <Divider style={{ margin: "12px 0" }} />

                      {loadingServices ? (
                        <Space>
                          <Spin size="small" />
                          <Text>Đang tải dịch vụ...</Text>
                        </Space>
                      ) : SERVICE_CATALOG.length === 0 ? (
                        <Empty description="Chưa có dịch vụ thêm" />
                      ) : (
                        <Checkbox.Group
                          value={serviceKeys}
                          onChange={(vals) => setServiceKeys(vals)}
                          style={{ width: "100%" }}
                        >
                          <Row gutter={[12, 10]}>
                            {SERVICE_CATALOG.map((s) => (
                              <Col xs={24} md={12} key={s.key}>
                                <Card
                                  style={{
                                    borderRadius: 16,
                                    background: "rgba(2,6,23,0.03)",
                                    border: "1px solid rgba(2,6,23,0.06)",
                                  }}
                                  styles={{ body: { padding: 12 } }}
                                >
                                  <Checkbox value={s.key} style={{ width: "100%" }}>
                                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                                      <Text strong>{s.name}</Text>
                                      <Text style={{ color: "rgba(11,18,32,0.70)" }}>
                                        {formatVND(s.price)}
                                      </Text>
                                    </Space>
                                  </Checkbox>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Checkbox.Group>
                      )}
                    </Card>

                    <div style={{ height: 14 }} />

                    {/* <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                      <Space align="center" size={10}>
                        <GiftOutlined />
                        <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                          Mã giảm giá
                        </Title>
                      </Space>

                      <Divider style={{ margin: "12px 0" }} />

                      <Space wrap style={{ width: "100%" }}>
                        <Input
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          placeholder="Nhập mã (demo: GIAM10, GIAM50K)"
                          style={{ width: 320, borderRadius: 12 }}
                        />
                        <Button
                          onClick={() => {
                            const code = String(coupon || "").trim().toUpperCase();
                            if (!code) return message.info("Nhập mã giảm giá trước đã");
                            if (code === "GIAM10" || code === "GIAM50K") message.success("Áp mã thành công (demo)");
                            else message.warning("Mã không hợp lệ (demo)");
                          }}
                          style={{ borderRadius: 12, fontWeight: 800 }}
                        >
                          Áp dụng
                        </Button>
                      </Space>

                      <div style={{ height: 8 }} />
                      <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                        * Demo rule: GIAM10 (-10% tối đa 100k), GIAM50K (-50k)
                      </Text>
                    </Card> */}
                  </Col>

                  <Col xs={24} lg={9}>
                    <Card className="glass-card" styles={{ body: { padding: 16 } }}>
                      <Space align="center" size={10}>
                        <CreditCardOutlined />
                        <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                          Xác nhận
                        </Title>
                      </Space>

                      <Divider style={{ margin: "12px 0" }} />

                      <Space direction="vertical" size={10} style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text>Sân loại</Text>
                          <Text strong>{typeLabel(fieldInfo?.type)}</Text>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text>Sân số</Text>
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

                        <Divider style={{ margin: "10px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text>Giá sân</Text>
                          <Text strong>{formatVND(basePrice)}</Text>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text>Dịch vụ</Text>
                          <Text strong>{formatVND(servicesTotal)}</Text>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text>Giảm giá</Text>
                          <Text strong style={{ color: "rgba(22,163,74,1)" }}>
                            -{formatVND(discount)}
                          </Text>
                        </div>

                        <Divider style={{ margin: "10px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text strong style={{ fontSize: 16 }}>Thành tiền</Text>
                          <Text strong style={{ fontSize: 16 }}>{formatVND(total)}</Text>
                        </div>

                        <Button
                          type="primary"
                          block
                          loading={submitting}
                          disabled={submitting}
                          onClick={onGoPayment}
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
                          Sang trang thanh toán
                        </Button>

                        <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                          * Trang Confirm chỉ chuyển hướng. Tạo đơn + thanh toán xử lý ở Payment.
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          </Card>
        </div>
      </div>
    </OtherLayout>
  );
}
