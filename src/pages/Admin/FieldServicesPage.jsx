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
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { fieldServiceApi } from "../../services/api/field_service.api";

const safeMsg = (err) =>
  err?.response?.data?.message || err?.message || "Có lỗi xảy ra";

const FieldServicesPage = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fieldServiceApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter((s) => {
      const name = (s.serviceName || "").toLowerCase();
      const price = String(s.price || "").toLowerCase();
      return name.includes(k) || price.includes(k);
    });
  }, [rows, q]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpenDrawer(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    form.setFieldsValue({
      serviceName: s.serviceName,
      price: s.price,
    });
    setOpenDrawer(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        serviceName: values.serviceName,
        price: values.price,
      };

      setLoading(true);
      if (editing?.serviceId || editing?.id) {
        const id = editing.serviceId ?? editing.id;
        await fieldServiceApi.update(id, payload);
        message.success("Cập nhật dịch vụ thành công");
      } else {
        await fieldServiceApi.create(payload);
        message.success("Tạo dịch vụ thành công");
      }

      setOpenDrawer(false);
      setEditing(null);
      form.resetFields();
      await fetchData();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (s) => {
    try {
      const id = s.serviceId ?? s.id;
      setLoading(true);
      await fieldServiceApi.remove(id);
      message.success("Xoá dịch vụ thành công");
      await fetchData();
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
      render: (_, s) => s.serviceId ?? s.id,
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "serviceName",
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 150,
      render: (v) => new Intl.NumberFormat("vi-VN").format(v) + " ₫",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Hành động",
      width: 160,
      render: (_, s) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} onClick={() => openEdit(s)} />
          </Tooltip>
          <Popconfirm
            title="Xoá dịch vụ?"
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
        bodyStyle={{ display: "flex", justifyContent: "space-between" }}
      >
        <Space>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc giá"
            allowClear
            style={{ width: 320 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Tải lại
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo dịch vụ
        </Button>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Table
          rowKey={(s) => s.serviceId ?? s.id}
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title={editing ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setEditing(null);
        }}
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
            label="Tên dịch vụ"
            name="serviceName"
            rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
          >
            <Input placeholder="Nước suối, Thuê áo..." />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Nhập giá" }]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 15000"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  );
};

export default FieldServicesPage;
