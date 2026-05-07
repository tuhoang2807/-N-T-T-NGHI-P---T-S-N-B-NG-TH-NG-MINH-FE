import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OtherLayout from "../../layouts/OtherLayout";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Button,
  Segmented,
  Space,
  message,
  Tooltip,
  Divider,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import { fieldSlotApi } from "../../services/api/fieldslot.api";
import { fieldApi } from "../../services/api/filed.api";
import { bookingApi } from "../../services/api/booking.api";

const { Title, Text } = Typography;

const DEFAULT_FIELD_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80";

const typeLabel = (t) => {
  if (t === "FIVE") return "Sân 5";
  if (t === "SEVEN") return "Sân 7";
  if (t === "ELEVEN") return "Sân 11";
  return t || "—";
};

const formatDateLabel = (d) => {
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
  const day = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  return `${weekday} • ${day}`;
};

const toLocalYMD = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const hhmm = (t) => (t ? String(t).slice(0, 5) : "");
const endLabel = (t) => {
  if (!t) return "";
  if (String(t) === "23:59:59") return "24:00";
  return hhmm(t);
};

const timeToMinutes = (t) => {
  if (!t) return null;
  const s = String(t).slice(0, 8);
  const [hh, mm] = s.split(":");
  const h = Number(hh);
  const m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const isSameDay = (a, b) =>
  a?.getFullYear() === b?.getFullYear() &&
  a?.getMonth() === b?.getMonth() &&
  a?.getDate() === b?.getDate();

const isPastSlot = (selectedDate, slotStart, bufferMinutes = 0) => {
  if (!selectedDate) return false;

  const now = new Date();
  if (!isSameDay(selectedDate, now)) return false;

  const startMin = timeToMinutes(slotStart);
  if (startMin == null) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  return startMin <= nowMin + bufferMinutes;
};

export default function FieldDetailPage() {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const fieldIdNum = Number(fieldId || 1);

  const [fieldInfo, setFieldInfo] = useState(null);
  const [loadingField, setLoadingField] = useState(false);

  const [mode, setMode] = useState("day");

  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNowTick((x) => x + 1), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const days = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const count = mode === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [mode]);

  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const selectedDate = days[selectedDateIdx];

  const [slotList, setSlotList] = useState([]);
  const [loadingSlot, setLoadingSlot] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingOccupied, setLoadingOccupied] = useState(false);
  const [occupiedSlotIds, setOccupiedSlotIds] = useState([]);

  useEffect(() => {
    const fetchField = async () => {
      try {
        setLoadingField(true);
        const res = await fieldApi.getById(fieldIdNum);
        const data = res?.data?.data;
        if (!data) throw new Error("No field data");
        setFieldInfo(data);
      } catch (e) {
        message.error("Không tải được thông tin sân");
        setFieldInfo(null);
      } finally {
        setLoadingField(false);
      }
    };

    fetchField();
  }, [fieldIdNum]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlot(true);
        const res = await fieldSlotApi.getAll();
        const data = res?.data?.data || [];
        setSlotList(Array.isArray(data) ? data : []);
      } catch (e) {
        message.error("Không tải được khung giờ (field slot)");
        setSlotList([]);
      } finally {
        setLoadingSlot(false);
      }
    };

    fetchSlots();
  }, []);

  useEffect(() => {
    const fetchOccupied = async () => {
      if (!fieldIdNum || !selectedDate) return;

      const dateStr = toLocalYMD(selectedDate);
      setLoadingOccupied(true);
      try {
        const res = await bookingApi.getOccupiedSlots(fieldIdNum, dateStr);
        const ids = res?.data?.data ?? [];
        setOccupiedSlotIds(Array.isArray(ids) ? ids : []);
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.message;
        message.error(apiMsg || "Không tải được danh sách giờ đã đặt");
        setOccupiedSlotIds([]);
      } finally {
        setLoadingOccupied(false);
      }
    };

    fetchOccupied();
  }, [fieldIdNum, selectedDateIdx, mode, selectedDate]);

  const occupiedSet = useMemo(
    () => new Set((occupiedSlotIds || []).map(Number)),
    [occupiedSlotIds]
  );

  const slotsOfField = useMemo(() => {
    return [...slotList].sort((a, b) => Number(a.slotNumber) - Number(b.slotNumber));
  }, [slotList]);

  const uiSlots = useMemo(() => {
    return slotsOfField.map((s) => ({
      slotId: s.slotId,
      slotNumber: s.slotNumber,
      label: `${hhmm(s.slotStart)} - ${endLabel(s.slotEnd)}`,
      start: s.slotStart,
      end: s.slotEnd,
      price: s.price,
      isPeak: !!s.isPeak,
    }));
  }, [slotsOfField]);

  const onPickSlot = (slot) => {
    const isBooked = occupiedSet.has(Number(slot.slotId));
    const isPast = isPastSlot(selectedDate, slot.start, 0);
    if (isBooked || isPast) return;

    setSelectedSlot((prev) => {
      if (prev?.slotId === slot.slotId) return null;
      return slot;
    });
  };

  const onChangeMode = (v) => {
    setMode(v);
    setSelectedDateIdx(0);
    setSelectedSlot(null);
  };

  const onPickDate = (idx) => {
    setSelectedDateIdx(idx);
    setSelectedSlot(null);
  };

  const heroImage =
    fieldInfo?.imageUrl && String(fieldInfo.imageUrl).trim()
      ? fieldInfo.imageUrl
      : DEFAULT_FIELD_IMAGE;

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
          .slot-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
          @media (max-width: 992px) { .slot-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
          @media (max-width: 576px) { .slot-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

          .slot-btn {
            border-radius: 14px !important;
            height: 44px !important;
            font-weight: 800 !important;
            transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
          }
          .slot-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(2,6,23,.12); }
          .slot-btn.disabled { opacity: 0.55; cursor: not-allowed; }
        `}</style>

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Card className="glass-card" styles={{ body: { padding: 0 } }}>
            <div style={{ position: "relative" }}>
              <img
                src={heroImage}
                alt={fieldInfo?.fieldName || "Field"}
                onError={(e) => (e.currentTarget.src = DEFAULT_FIELD_IMAGE)}
                style={{
                  width: "100%",
                  height: 320,
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
                    "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.62) 100%)",
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                }}
              />

              <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                  <Col>
                    {loadingField ? (
                      <Space>
                        <Spin size="small" />
                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                          Đang tải thông tin sân...
                        </Text>
                      </Space>
                    ) : fieldInfo ? (
                      <Space direction="vertical" size={6}>
                        <Space wrap>
                          <Tag color="blue" style={{ borderRadius: 999, fontWeight: 800 }}>
                            {typeLabel(fieldInfo.type)}
                          </Tag>
                          <Tag
                            color={fieldInfo.status === "ACTIVE" ? "green" : "default"}
                            style={{ borderRadius: 999, fontWeight: 800 }}
                          >
                            {fieldInfo.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
                          </Tag>
                        </Space>

                        <Title level={2} style={{ margin: 0, color: "white", fontWeight: 900 }}>
                          {fieldInfo.fieldName}
                        </Title>

                        <Space size={6}>
                          <EnvironmentOutlined style={{ color: "rgba(255,255,255,0.82)" }} />
                          <Text style={{ color: "rgba(255,255,255,0.82)" }}>
                            Chưa có địa chỉ
                          </Text>
                        </Space>
                      </Space>
                    ) : (
                      <Text style={{ color: "rgba(255,255,255,0.82)" }}>
                        Không có dữ liệu sân
                      </Text>
                    )}
                  </Col>

                  <Col>
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      disabled={!fieldInfo}
                      style={{
                        borderRadius: 14,
                        height: 44,
                        fontWeight: 900,
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
                        border: "none",
                        boxShadow: "0 18px 45px rgba(99,102,241,0.22)",
                      }}
                      onClick={() => message.info("Cuộn xuống chọn khung giờ 👇")}
                    >
                      Đặt ngay
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Text style={{ color: "rgba(11,18,32,0.62)" }}>
                    {fieldInfo?.description || "—"}
                  </Text>
                </Col>
                <Col xs={24} md={8}>
                  <div
                    style={{
                      borderRadius: 16,
                      background: "rgba(2,6,23,0.04)",
                      padding: 14,
                    }}
                  >
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Space>
                        <CalendarOutlined />
                        <Text strong>Chọn ngày & khung giờ</Text>
                      </Space>
                      <Text style={{ color: "rgba(11,18,32,0.62)" }}>
                        Giờ đã đặt sẽ bị khóa. Giờ đã qua trong ngày cũng sẽ bị khóa.
                      </Text>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          <div style={{ height: 14 }} />

          <Card className="glass-card" styles={{ body: { padding: 18 } }}>
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col>
                <Space align="center" size={10}>
                  <ClockCircleOutlined />
                  <Title level={4} style={{ margin: 0, fontWeight: 900 }}>
                    Chọn lịch
                  </Title>
                  {loadingOccupied && (
                    <Space size={6} style={{ marginLeft: 10 }}>
                      <Spin size="small" />
                      <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                        Đang tải giờ đã đặt...
                      </Text>
                    </Space>
                  )}
                </Space>
              </Col>

              <Col>
                <Segmented
                  value={mode}
                  onChange={onChangeMode}
                  options={[
                    { label: "Trong ngày", value: "day" },
                    { label: "7 ngày", value: "week" },
                  ]}
                />
              </Col>
            </Row>

            {mode === "week" && (
              <>
                <Divider style={{ margin: "14px 0" }} />
                <Space wrap>
                  {days.map((d, idx) => {
                    const active = idx === selectedDateIdx;
                    return (
                      <Button
                        key={idx}
                        onClick={() => onPickDate(idx)}
                        style={{
                          borderRadius: 14,
                          height: 42,
                          fontWeight: 900,
                          borderColor: active ? "rgba(56,161,105,0.65)" : "rgba(0,0,0,0.08)",
                          background: active
                            ? "rgba(56,161,105,0.12)"
                            : "rgba(255,255,255,0.55)",
                        }}
                      >
                        {formatDateLabel(d)}
                      </Button>
                    );
                  })}
                </Space>
              </>
            )}

            <Divider style={{ margin: "14px 0" }} />

            <Space wrap>
              <Tag icon={<CheckCircleOutlined />} color="green" style={{ borderRadius: 999 }}>
                Trống
              </Tag>
              <Tag icon={<CloseCircleOutlined />} color="default" style={{ borderRadius: 999 }}>
                Đã đặt
              </Tag>
              <Tag icon={<CloseCircleOutlined />} color="default" style={{ borderRadius: 999 }}>
                Đã qua giờ
              </Tag>
              <Tag icon={<FireOutlined />} color="red" style={{ borderRadius: 999 }}>
                Peak
              </Tag>
            </Space>

            <div style={{ height: 12 }} />

            {loadingSlot ? (
              <div style={{ padding: "22px 0", textAlign: "center" }}>
                <Spin />
                <div style={{ height: 8 }} />
                <Text style={{ color: "rgba(11,18,32,0.55)" }}>Đang tải khung giờ...</Text>
              </div>
            ) : uiSlots.length === 0 ? (
              <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                Không có khung giờ cho sân này.
              </Text>
            ) : (
              <div className="slot-grid">
                {uiSlots.map((slot) => {
                  void nowTick;

                  const isBooked = occupiedSet.has(Number(slot.slotId));
                  const isPast = isPastSlot(selectedDate, slot.start, 0);
                  const disabled = isBooked || isPast;

                  const isSelected = selectedSlot?.slotId === slot.slotId;

                  return (
                    <Tooltip
                      key={slot.slotId}
                      title={
                        isBooked
                          ? "Khung giờ đã được đặt"
                          : isPast
                          ? "Khung giờ đã qua"
                          : `Chọn: ${slot.label} • ${Number(slot.price).toLocaleString("vi-VN")}đ`
                      }
                    >
                      <Button
                        className={`slot-btn ${disabled ? "disabled" : ""}`}
                        block
                        disabled={disabled}
                        onClick={() => onPickSlot(slot)}
                        style={{
                          background: disabled
                            ? "rgba(0,0,0,0.04)"
                            : isSelected
                            ? "rgba(56,161,105,0.16)"
                            : slot.isPeak
                            ? "rgba(239,68,68,0.08)"
                            : "rgba(255,255,255,0.75)",
                          borderColor: disabled
                            ? "rgba(0,0,0,0.10)"
                            : isSelected
                            ? "rgba(56,161,105,0.80)"
                            : slot.isPeak
                            ? "rgba(239,68,68,0.35)"
                            : "rgba(56,161,105,0.30)",
                          color: disabled ? "rgba(0,0,0,0.35)" : "rgba(11,18,32,0.88)",
                        }}
                      >
                        <Space size={6}>
                          {slot.isPeak && <FireOutlined />}
                          <span>{slot.label}</span>
                        </Space>
                      </Button>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            <div style={{ height: 14 }} />

            <Card
              className="glass-card"
              styles={{ body: { padding: 14 } }}
              style={{ background: "rgba(255,255,255,0.65)" }}
            >
              <Row align="middle" justify="space-between" gutter={[12, 12]}>
                <Col>
                  {selectedSlot ? (
                    <Space direction="vertical" size={2}>
                      <Text strong>Đã chọn:</Text>
                      <Text>
                        {formatDateLabel(selectedDate)} •{" "}
                        <Text strong>{selectedSlot.label}</Text>
                        {selectedSlot.isPeak && (
                          <Tag
                            icon={<FireOutlined />}
                            color="red"
                            style={{ marginLeft: 8, borderRadius: 999 }}
                          >
                            Peak
                          </Tag>
                        )}
                      </Text>
                      <Text style={{ color: "rgba(11,18,32,0.62)" }}>
                        Giá: {Number(selectedSlot.price).toLocaleString("vi-VN")}đ
                      </Text>
                    </Space>
                  ) : (
                    <Text style={{ color: "rgba(11,18,32,0.55)" }}>
                      Chọn 1 khung giờ để đặt sân
                    </Text>
                  )}
                </Col>

                <Col>
                  <Button
                    type="primary"
                    disabled={!selectedSlot || !fieldInfo || fieldInfo?.status !== "ACTIVE"}
                    icon={<ArrowRightOutlined />}
                    style={{
                      borderRadius: 14,
                      height: 44,
                      fontWeight: 900,
                      background:
                        selectedSlot && fieldInfo?.status === "ACTIVE"
                          ? "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))"
                          : undefined,
                      border: "none",
                      boxShadow:
                        selectedSlot && fieldInfo?.status === "ACTIVE"
                          ? "0 18px 45px rgba(99,102,241,0.22)"
                          : "none",
                    }}
                    onClick={() => {
                      if (!selectedSlot || !fieldInfo) return;

                      const isPast = isPastSlot(selectedDate, selectedSlot.start, 0);
                      if (isPast) {
                        message.warning("Khung giờ này đã qua, vui lòng chọn khung giờ khác.");
                        setSelectedSlot(null);
                        return;
                      }

                      navigate("/booking/confirm", {
                        state: {
                          fieldId: fieldInfo?.fieldId,
                          date: toLocalYMD(selectedDate),
                          slotId: selectedSlot?.slotId,
                        },
                      });
                    }}
                  >
                    Đặt sân
                  </Button>

                  {fieldInfo?.status !== "ACTIVE" && (
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: "rgba(185,28,28,0.80)" }}>
                        Sân đang tạm ngưng, không thể đặt.
                      </Text>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          </Card>

          <div style={{ height: 18 }} />
        </div>
      </div>
    </OtherLayout>
  );
}