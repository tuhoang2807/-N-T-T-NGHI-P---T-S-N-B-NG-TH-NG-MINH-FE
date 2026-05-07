import React, { useMemo, useState } from "react";
import { Layout, Menu, Typography, Space, Avatar, Dropdown, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { AppstoreOutlined } from "@ant-design/icons";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/admin/users")) return "/admin/users";
    if (p.startsWith("/admin/bookings")) return "/admin/bookings";
    if (p.startsWith("/admin/payments")) return "/admin/payments";
    if (p.startsWith("/admin/settings")) return "/admin/settings";
    if (p.startsWith("/admin/field-slots")) return "/admin/field-slots";
    if (p.startsWith("/admin/services")) return "/admin/services";

    return "/admin";
  }, [location.pathname]);

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/admin/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
    { key: "/admin/field-slots", icon: <ClockCircleOutlined />, label: "Quản lý Khung giờ" },
    { key: "/admin/bookings", icon: <CalendarOutlined />, label: "Quản lý đơn đặt sân" },
    // { key: "/admin/payments", icon: <DollarOutlined />, label: "Thanh toán" },
    // { key: "/admin/settings", icon: <SettingOutlined />, label: "Cài đặt" },
  { key: "/admin/services", icon: <AppstoreOutlined />, label: "Quản lý dịch vụ" },
  ];

  const userMenu = {
    items: [
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: () => {
          // TODO: clear token nếu có
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} trigger={null} width={260}>
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            SB
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <Text style={{ color: "#fff", fontWeight: 700 }}>Soccer Booking</Text>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Admin Panel
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ paddingTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Space>
            <Button
              type="text"
              onClick={() => setCollapsed((v) => !v)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
            <Text strong>Admin</Text>
          </Space>

          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <Text>Admin</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 16, background: "#f6f7fb" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
