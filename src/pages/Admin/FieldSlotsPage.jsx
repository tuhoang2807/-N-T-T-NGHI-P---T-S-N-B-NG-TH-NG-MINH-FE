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
  Select,
  TimePicker,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { fieldSlotApi } from "../../services/api/fieldSlot.api";

const { Option } = Select;

const safeMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra. Vui lòng thử lại.";

const FieldSlotsPage = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [openDrawer, setOpenDrawer] = useState(false);
  const [form] = Form.useForm();

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fieldSlotApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((s) => {
      const slotNumber = String(s.slotNumber ?? "").toLowerCase();
      const start = String(s.slotStart ?? s.startTime ?? "").toLowerCase();
      const end = String(s.slotEnd ?? s.endTime ?? "").toLowerCase();
      const price = String(s.price ?? s.slotPrice ?? "").toLowerCase();
      const isPeak = String(s.isPeak ?? "").toLowerCase();
      return (
        slotNumber.includes(keyword) ||
        start.includes(keyword) ||
        end.includes(keyword) ||
        price.includes(keyword) ||
        isPeak.includes(keyword)
      );
    });
  }, [rows, q]);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      isPeak: false,
      // default 60 phút
      timeRange: [dayjs("07:00", "HH:mm"), dayjs("08:00", "HH:mm")],
    });
    setOpenDrawer(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const start = values.timeRange?.[0];
      const end = values.timeRange?.[1];

      const payload = {
        slotNumber: values.slotNumber,
        slotStart: start ? dayjs(start).format("HH:mm:ss") : null,
        slotEnd: end ? dayjs(end).format("HH:mm:ss") : null,
        price: values.price,
        isPeak: values.isPeak,
        // nếu backend của mày có thêm field khác (fieldId, status...) thì add tại đây
      };

      setLoading(true);
      await fieldSlotApi.create(payload);

      message.success("Tạo khung giờ thành công");
      setOpenDrawer(false);
      form.resetFields();
      await fetchSlots();
    } catch (err) {
      if (err?.errorFields) return; // lỗi validate
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (s) => {
    try {
      const id = s.slotId ?? s.id;
      setLoading(true);
      await fieldSlotApi.remove(id);
      message.success("Xoá khung giờ thành công");
      await fetchSlots();
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      width: 90,
      render: (_, s) => s.slotId ?? s.id ?? "-",
    },
    {
      title: "Slot #",
      dataIndex: "slotNumber",
      width: 100,
      render: (v) => v ?? "-",
      sorter: (a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0),
    },
    {
      title: "Bắt đầu",
      dataIndex: "slotStart",
      width: 120,
      render: (v, s) => v ?? s.startTime ?? "-",
    },
    {
      title: "Kết thúc",
      dataIndex: "slotEnd",
      width: 120,
      render: (v, s) => v ?? s.endTime ?? "-",
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 140,
      render: (v, s) => {
        const val = v ?? s.slotPrice;
        if (val === null || val === undefined) return "-";
        return new Intl.NumberFormat("vi-VN").format(val) + " ₫";
      },
      sorter: (a, b) => (a.price ?? 0) - (b.price ?? 0),
    },
    {
      title: "Peak",
      dataIndex: "isPeak",
      width: 120,
      render: (v) => (v ? <Tag color="red">PEAK</Tag> : <Tag>OFF-PEAK</Tag>),
      filters: [
        { text: "PEAK", value: true },
        { text: "OFF-PEAK", value: false },
      ],
      onFilter: (value, record) => Boolean(record.isPeak) === Boolean(value),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 140,
      render: (_, s) => (
        <Space>
          <Popconfirm
            title="Xoá khung giờ?"
            description="Nếu slot đang dính booking thì backend sẽ chặn."
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => onDelete(s)}
          >
            <Tooltip title="Xoá">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <Space>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo slotNumber / giờ / giá / peak"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 360 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchSlots}>
            Tải lại
          </Button>
        </Space>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo khung giờ
        </Button>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Table
          rowKey={(s) => s.slotId ?? s.id}
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Drawer
        title="Tạo khung giờ"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        width={420}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setOpenDrawer(false)}>Huỷ</Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Slot number"
            name="slotNumber"
            rules={[{ required: true, message: "Nhập slot number" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Ví dụ: 1" />
          </Form.Item>

          <Form.Item
            label="Khung giờ"
            name="timeRange"
            rules={[{ required: true, message: "Chọn giờ bắt đầu/kết thúc" }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Nhập giá" }]}
          >
            <InputNumber
              min={0}
              step={10000}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 300000"
            />
          </Form.Item>

          <Form.Item label="Giờ cao điểm" name="isPeak" initialValue={false}>
            <Select>
              <Option value={true}>PEAK</Option>
              <Option value={false}>OFF-PEAK</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  );
};

export default FieldSlotsPage;
