import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Space, DatePicker, Statistic, Table, Tag, Button, message } from "antd";
import { ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { adminBookingApi } from "../services/api/admin_booking.api";

import {
  ResponsiveContainer,
  LineChart, Line,
  CartesianGrid,
  XAxis, YAxis,
  Tooltip as RTooltip,
  Legend,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";

const { RangePicker } = DatePicker;

const safeMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra";

const formatVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

const STATUS_META = {
  PENDING_DEPOSIT: { label: "Chờ cọc", color: "gold" },
  DEPOSITED: { label: "Đã cọc", color: "blue" },
  CHECKED_IN: { label: "Đã check-in", color: "cyan" },
  COMPLETED: { label: "Hoàn tất", color: "green" },
  CANCELLED: { label: "Đã huỷ", color: "red" },
  EXPIRED: { label: "Hết hạn", color: "volcano" },
};

const statusTag = (st) => {
  const m = STATUS_META[st] || { label: st || "—", color: "default" };
  return <Tag color={m.color}>{m.label}</Tag>;
};

const DashboardPage = () => {
  const navigate = useNavigate();

  // 7 ngày gần nhất
  const [range, setRange] = useState([dayjs().startOf("day").add(-6, "day"), dayjs().endOf("day")]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);

  // data raw để vẽ chart (lấy nhiều hơn latest)
  const [raw, setRaw] = useState([]);

  const params = useMemo(() => {
    const from = dayjs(range?.[0] || dayjs()).format("YYYY-MM-DD");
    const to = dayjs(range?.[1] || dayjs()).format("YYYY-MM-DD");
    return { from, to };
  }, [range]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, latestRes, rawRes] = await Promise.all([
        adminBookingApi.stats(params.from, params.to),
        adminBookingApi.list({ page: 0, size: 10, from: params.from, to: params.to }),
        // lấy nhiều để dựng chart (tuỳ data bạn chỉnh size)
        adminBookingApi.list({ page: 0, size: 1000, from: params.from, to: params.to }),
      ]);

      setStats(sRes?.data?.data || null);

      const pLatest = latestRes?.data?.data;
      setLatest(pLatest?.content || []);

      const pRaw = rawRes?.data?.data;
      setRaw(pRaw?.content || []);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.from, params.to]);

  // ======= CHART DATA =======

  // 1) Line: bookings per day
  const lineData = useMemo(() => {
    const map = new Map();

    // init all days in range to 0 (để chart không bị đứt)
    const start = dayjs(params.from);
    const end = dayjs(params.to);
    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      map.set(d.format("YYYY-MM-DD"), { date: d.format("DD/MM"), count: 0 });
    }

    raw.forEach((b) => {
      const key = b.bookingDate; // "YYYY-MM-DD"
      if (!key) return;
      const cur = map.get(key);
      if (cur) cur.count += 1;
      else map.set(key, { date: dayjs(key).format("DD/MM"), count: 1 });
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);
  }, [raw, params.from, params.to]);

  // 2) Bar: paid per day
  const barData = useMemo(() => {
    const map = new Map();
    const start = dayjs(params.from);
    const end = dayjs(params.to);
    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      map.set(d.format("YYYY-MM-DD"), { date: d.format("DD/MM"), paid: 0 });
    }

    raw.forEach((b) => {
      const key = b.bookingDate;
      if (!key) return;
      const cur = map.get(key);
      const paid = Number(b.paidAmount || 0);
      if (cur) cur.paid += paid;
      else map.set(key, { date: dayjs(key).format("DD/MM"), paid });
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);
  }, [raw, params.from, params.to]);

  // 3) Pie: status distribution
  const pieData = useMemo(() => {
    const counts = {};
    Object.keys(STATUS_META).forEach((k) => (counts[k] = 0));

    raw.forEach((b) => {
      const st = b.status || "UNKNOWN";
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        key: k,
        name: STATUS_META[k]?.label || k,
        value: v,
      }));
  }, [raw]);

  // Pie colors (không set theo theme antd cho đẹp, nhưng vẫn ổn)
  const pieColors = ["#f59e0b", "#3b82f6", "#06b6d4", "#22c55e", "#ef4444", "#f97316", "#64748b"];

  // ======= LATEST TABLE =======
  const columns = [
    { title: "ID", dataIndex: "bookingId", width: 90 },
    {
      title: "Ngày",
      dataIndex: "bookingDate",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    { title: "Sân", dataIndex: "fieldName" },
    {
      title: "Giờ",
      width: 150,
      render: (_, r) =>
        `${String(r.slotStart || "").slice(0, 5)} - ${String(r.slotEnd || "").slice(0, 5)}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      render: (v) => statusTag(v),
    },
    {
      title: "Tổng",
      dataIndex: "totalPrice",
      width: 150,
      align: "right",
      render: (v) => formatVND(v),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Header */}
      <Card style={{ borderRadius: 16 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space>
              <CalendarOutlined />
              <b>Dashboard</b>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <RangePicker
                value={range}
                onChange={(v) => setRange(v)}
                format="DD/MM/YYYY"
                allowClear={false}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>
                Tải lại
              </Button>
              <Button type="primary" onClick={() => navigate("/admin/bookings")}>
                Quản lý đặt sân
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats cards */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 16 }} loading={loading}>
            <Statistic title="Tổng đơn" value={stats?.totalBookings ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 16 }} loading={loading}>
            <Statistic title="Chờ cọc" value={stats?.pendingDeposit ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 16 }} loading={loading}>
            <Statistic title="Đã cọc" value={stats?.deposited ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 16 }} loading={loading}>
            <Statistic title="Doanh thu (paid)" value={formatVND(stats?.paidTotal ?? 0)} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[12, 12]}>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 16 }} title="Bookings theo ngày" loading={loading}>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Số đơn" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16 }} title="Tỉ lệ trạng thái" loading={loading}>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <RTooltip />
                  <Legend />
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card style={{ borderRadius: 16 }} title="Doanh thu (paid) theo ngày" loading={loading}>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RTooltip formatter={(v) => formatVND(v)} />
                  <Legend />
                  <Bar dataKey="paid" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Latest */}
      <Card style={{ borderRadius: 16 }} title="Đơn mới nhất (Top 10)">
        <Table rowKey="bookingId" loading={loading} columns={columns} dataSource={latest} pagination={false} />
      </Card>
    </Space>
  );
};

export default DashboardPage;
