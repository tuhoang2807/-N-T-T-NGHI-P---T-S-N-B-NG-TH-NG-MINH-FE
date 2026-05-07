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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { userApi } from "../../services/api/user.api";

const { Option } = Select;

const safeMsg = (err) =>
  err?.response?.data?.message ||
  err?.message ||
  "Có lỗi xảy ra. Vui lòng thử lại.";

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editing, setEditing] = useState(null); // user object
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      // tuỳ backend của mày trả {data: ...} hay ...:
      const data = res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((u) => {
      const name = (u.fullName || u.name || "").toLowerCase();
      const phone = (u.phone || u.phoneNumber || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(keyword) || phone.includes(keyword) || email.includes(keyword);
    });
  }, [rows, q]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpenDrawer(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    form.setFieldsValue({
      fullName: u.fullName || u.name,
      phone: u.phone || u.phoneNumber,
      email: u.email,
      role: u.role,
      status: u.status,
    });
    setOpenDrawer(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        role: values.role,
        status: values.status,
      };

      setLoading(true);
      if (editing?.id || editing?.userId) {
        const id = editing.id ?? editing.userId;
        await userApi.update(id, payload);
        message.success("Cập nhật người dùng thành công");
      } else {
        await userApi.create(payload);
        message.success("Tạo người dùng thành công");
      }

      setOpenDrawer(false);
      setEditing(null);
      form.resetFields();
      await fetchUsers();
    } catch (err) {
      // validateFields throw object, còn api throw error
      if (err?.errorFields) return;
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (u) => {
    try {
      const id = u.id ?? u.userId;
      setLoading(true);
      await userApi.remove(id);
      message.success("Xoá người dùng thành công");
      await fetchUsers();
    } catch (err) {
      message.error(safeMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 90,
      render: (_, u) => u.id ?? u.userId ?? "-",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      render: (_, u) => u.fullName || u.name || "-",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      render: (_, u) => u.phone || u.phoneNumber || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (v) => v || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 120,
      render: (v) => <Tag>{v || "USER"}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (v) => {
        const val = v || "ACTIVE";
        const color = val === "ACTIVE" ? "green" : val === "BLOCKED" ? "red" : "default";
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_, u) => (
        <Space>
          <Tooltip title="Sửa">
            <Button icon={<EditOutlined />} onClick={() => openEdit(u)} />
          </Tooltip>

          <Popconfirm
            title="Xoá người dùng?"
            description="Hành động này không thể hoàn tác."
            okText="Xoá"
            cancelText="Huỷ"
            onConfirm={() => onDelete(u)}
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
            placeholder="Tìm theo tên / SĐT / email"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 320 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            Tải lại
          </Button>
        </Space>

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo người dùng
        </Button>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Table
          rowKey={(u) => u.id ?? u.userId}
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Drawer
        title={editing ? "Cập nhật người dùng" : "Tạo người dùng"}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setEditing(null);
        }}
        width={420}
        destroyOnClose
        extra={
          <Space>
            <Button
              onClick={() => {
                setOpenDrawer(false);
                setEditing(null);
              }}
            >
              Huỷ
            </Button>
            <Button type="primary" onClick={onSubmit} loading={loading}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{9,12}$/, message: "SĐT không hợp lệ" },
            ]}
          >
            <Input placeholder="098xxxxxxx" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
            <Input placeholder="abc@gmail.com" />
          </Form.Item>

          <Form.Item label="Role" name="role" initialValue="USER">
            <Select>
              <Option value="USER">USER</Option>
              <Option value="ADMIN">ADMIN</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" initialValue="ACTIVE">
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="BLOCKED">BLOCKED</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  );
};

export default UsersPage;
