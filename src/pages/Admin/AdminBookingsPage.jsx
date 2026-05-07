import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Input,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Drawer,
  Form,
  DatePicker,
  Select,
  InputNumber,
  Divider,
  Descriptions,
  List,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { adminBookingApi } from "../../services/api/admin_booking.api";
import { bookingApi } from "../../services/api/booking.api";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const safeMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra";

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

const STATUS_META = {
  PENDING_DEPOSIT: { color: "gold", label: "Chờ cọc" },
  DEPOSITED: { color: "blue", label: "Đã cọc" },
  CHECKED_IN: { color: "cyan", label: "Đã check-in" },
  COMPLETED: { color: "green", label: "Hoàn tất" },
  CANCELLED: { color: "red", label: "Đã huỷ" },
  EXPIRED: { color: "volcano", label: "Hết hạn" },
};

const statusTag = (st) => {
  const m = STATUS_META[st] || { color: "default", label: st || "—" };
  return <Tag color={m.color}>{m.label}</Tag>;
};

const AdminBookingsPage = () => {
  // ===== list =====
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // ===== filters =====
  const [q, setQ] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [range, setRange] = useState(null);

  // ===== pagination =====
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ===== detail =====
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ===== action drawers =====
  const [openPaid, setOpenPaid] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const [openNote, setOpenNote] = useState(false);

  const [paidForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [noteForm] = Form.useForm();

  // ===== query params =====
  const queryParams = useMemo(() => {
    const params = {
      page: page - 1,
      size: pageSize,
      q: q?.trim() || undefined,
      statuses: statuses.length ? statuses : undefined,
    };
    if (range?.[0] && range?.[1]) {
      params.from = dayjs(range[0]).format("YYYY-MM-DD");
      params.to = dayjs(range[1]).format("YYYY-MM-DD");
    }
    return params;
  }, [page, pageSize, q, statuses, range]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await adminBookingApi.list(queryParams);
      const p = res?.data?.data;
      setRows(p?.content || []);
      setTotal(p?.totalElements || 0);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [queryParams]);

  // ===== detail =====
  const openDetailDrawer = async (record) => {
    setOpenDetail(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await adminBookingApi.detail(record.bookingId);
      setDetail(res?.data?.data);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshAll = async () => {
    await fetchList();
    if (detail?.bookingId) {
      const res = await adminBookingApi.detail(detail.bookingId);
      setDetail(res?.data?.data);
    }
  };

  const closeAllActionDrawers = () => {
    setOpenPaid(false);
    setOpenRefund(false);
    setOpenNote(false);
    paidForm.resetFields();
    refundForm.resetFields();
    noteForm.resetFields();
  };

  // ===== actions =====
  const doCheckin = async (id) => {
    try {
      setLoading(true);
      await bookingApi.checkIn(id);
      message.success("Check-in thành công");
      await refreshAll();
    } catch (e) {
      message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const doCancel = async (id) => {
    try {
      setLoading(true);
      await bookingApi.cancel(id);
      message.success("Huỷ booking thành công");
      await refreshAll();
    } catch (e) {
      message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const doExpire = async (id) => {
    try {
      setLoading(true);
      await adminBookingApi.expire(id, "ADMIN");
      message.success("Đã chuyển EXPIRED");
      await refreshAll();
    } catch (e) {
      message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  // ===== open drawers =====
  const openMarkPaidDrawer = () => {
    closeAllActionDrawers();
    setOpenPaid(true);
  };

  const openRefundDrawer = () => {
    closeAllActionDrawers();
    setOpenRefund(true);
  };

  const openNoteDrawer = () => {
    closeAllActionDrawers();
    setOpenNote(true);
    noteForm.setFieldsValue({ note: detail?.adminNote || "" });
  };

  // ===== submit drawers =====
  const submitMarkPaid = async () => {
    try {
      const v = await paidForm.validateFields();
      setLoading(true);
      await adminBookingApi.markPaid(detail.bookingId, { amount: v.amount ?? null });
      message.success("Thanh toán thành công");
      closeAllActionDrawers();
      await refreshAll();
    } catch (e) {
      if (!e?.errorFields) message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const submitRefund = async () => {
    try {
      const v = await refundForm.validateFields();
      setLoading(true);
      await adminBookingApi.refund(detail.bookingId, v);
      message.success("Hoàn tiền thành công");
      closeAllActionDrawers();
      await refreshAll();
    } catch (e) {
      if (!e?.errorFields) message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const submitNote = async () => {
    try {
      const v = await noteForm.validateFields();
      setLoading(true);
      await adminBookingApi.updateNote(detail.bookingId, v.note || "");
      message.success("Lưu ghi chú thành công");
      closeAllActionDrawers();
      await refreshAll();
    } catch (e) {
      if (!e?.errorFields) message.error(safeMsg(e));
    } finally {
      setLoading(false);
    }
  };

  // ===== table =====
  const columns = [
    { title: "ID", dataIndex: "bookingId", width: 90 },
    {
      title: "Ngày",
      dataIndex: "bookingDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    { title: "Sân", dataIndex: "fieldName" },
    {
      title: "Giờ",
      render: (_, r) =>
        `${String(r.slotStart).slice(0, 5)} - ${String(r.slotEnd).slice(0, 5)}`,
    },
    {
      title: "User",
      render: (_, r) => (
        <div>
          <b>{r.userFullName}</b>
          <div>{r.userPhone}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: statusTag,
    },
    {
      title: "Tổng",
      dataIndex: "totalPrice",
      align: "right",
      render: formatVND,
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDetailDrawer(r)} />
          <Button
            icon={<CheckCircleOutlined />}
            disabled={r.status !== "DEPOSITED"}
            onClick={() => doCheckin(r.bookingId)}
          />
          <Popconfirm
            title="Huỷ booking?"
            onConfirm={() => doCancel(r.bookingId)}
          >
            <Button danger icon={<CloseCircleOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm user / sân"
            allowClear
            style={{ width: 280 }}
          />
          <Select
            mode="multiple"
            allowClear
            value={statuses}
            onChange={setStatuses}
            placeholder="Trạng thái"
            options={Object.keys(STATUS_META).map((k) => ({
              value: k,
              label: STATUS_META[k].label,
            }))}
            style={{ width: 220 }}
          />
          <RangePicker value={range} onChange={setRange} />
          <Button icon={<ReloadOutlined />} onClick={fetchList}>
            Tải lại
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="bookingId"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      {/* DETAIL DRAWER */}
      <Drawer
        title={`Booking #${detail?.bookingId}`}
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        width={720}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={openNoteDrawer}>
              Ghi chú
            </Button>
            <Button
              type="primary"
              icon={<DollarCircleOutlined />}
              onClick={openMarkPaidDrawer}
            >
              Thanh toán
            </Button>
            <Button icon={<UndoOutlined />} onClick={openRefundDrawer}>
              Hoàn tiền
            </Button>
            <Popconfirm
              title="Chuyển EXPIRED?"
              onConfirm={() => doExpire(detail.bookingId)}
            >
              <Button danger>Expire</Button>
            </Popconfirm>
          </Space>
        }
      >
        {detailLoading ? "Đang tải..." : detail && (
          <>
            {statusTag(detail.status)}
            <Divider />
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="User">{detail.userFullName}</Descriptions.Item>
              <Descriptions.Item label="Sân">{detail.fieldName}</Descriptions.Item>
              <Descriptions.Item label="Tổng">{formatVND(detail.totalPrice)}</Descriptions.Item>
              <Descriptions.Item label="Đã trả">{formatVND(detail.paidAmount)}</Descriptions.Item>
            </Descriptions>
          </>
        )}

        {/* MARK PAID */}
        <Drawer
          title="Thanh toán"
          open={openPaid}
          onClose={() => setOpenPaid(false)}
          width={420}
          extra={
            <Button type="primary" onClick={submitMarkPaid}>
              Xác nhận
            </Button>
          }
        >
          <Form layout="vertical" form={paidForm}>
            <Form.Item label="Số tiền" name="amount">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Drawer>

        {/* REFUND */}
        <Drawer
          title="Hoàn tiền"
          open={openRefund}
          onClose={() => setOpenRefund(false)}
          width={420}
          extra={
            <Button type="primary" onClick={submitRefund}>
              Hoàn tiền
            </Button>
          }
        >
          <Form layout="vertical" form={refundForm}>
            <Form.Item label="Số tiền" name="amount">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Lý do" name="reason">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Drawer>

        {/* NOTE */}
        <Drawer
          title="Ghi chú admin"
          open={openNote}
          onClose={() => setOpenNote(false)}
          width={420}
          extra={
            <Button type="primary" onClick={submitNote}>
              Lưu
            </Button>
          }
        >
          <Form layout="vertical" form={noteForm}>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={5} />
            </Form.Item>
          </Form>
        </Drawer>
      </Drawer>
    </Space>
  );
};

export default AdminBookingsPage;
