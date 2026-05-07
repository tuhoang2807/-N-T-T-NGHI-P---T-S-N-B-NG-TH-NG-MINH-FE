import React, { useState } from "react";
import {
  Dropdown,
  Avatar,
  Input,
  Badge,
  Button,
  message,
  Space,
  Typography,
} from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  ReadOutlined,
  PhoneOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  LoginOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const { Search } = Input;
const { Text } = Typography;

const navLinkStyle = ({ isActive }) => ({
  color: "white",
  fontWeight: 600,
  padding: "8px 12px",
  textDecoration: "none",
  transition: "all 0.2s ease",
  borderBottom: `2px solid ${isActive ? "#38a169" : "transparent"}`,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth(); // ✅ lấy thêm user
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await logout();
      message.success("Đã đăng xuất ✅");
      navigate("/login");
    } catch (e) {
      message.error("Đăng xuất thất bại");
    } finally {
      setLogoutLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: "1",
      label: (
        <div className="d-flex align-items-center py-2">
          <UserOutlined className="me-3 fs-5" />
          <span className="fw-medium">Hồ sơ</span>
        </div>
      ),
      onClick: () => navigate("/profile"),
    },
    {
      key: "2",
      label: (
        <div className="d-flex align-items-center py-2">
          <ShoppingCartOutlined className="me-3 fs-5" />
          <span className="fw-medium">Đơn đặt của bạn</span>
        </div>
      ),
      onClick: () => navigate("/my-booking"),
    },
    { type: "divider" },
    {
      key: "3",
      danger: true,
      disabled: logoutLoading,
      label: (
        <div className="d-flex align-items-center py-2">
          <LogoutOutlined className="me-3 fs-5" />
          <span className="fw-medium">
            {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
          </span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  const displayName = user?.fullName || "Tài khoản";

  return (
    <nav
      className="navbar navbar-expand-lg position-relative py-3 px-4"
      style={{
        backgroundColor: "#1a365d",
        boxShadow: "0 2px 10px rgba(0, 118, 225, 0.2)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="container-fluid">
        {/* Logo */}
        <NavLink
          to="/"
          className="navbar-brand fw-bold fs-3 text-white d-flex align-items-center"
          style={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            letterSpacing: "0.5px",
            textDecoration: "none",
            gap: 10,
          }}
        >
          <CalendarOutlined className="fs-4 text-success" />
          Tú Hoàng
        </NavLink>

        <button
          className="navbar-toggler border-0 p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menu chính */}
          <ul className="navbar-nav mx-auto mb-0">
            <li className="nav-item mx-2">
              <NavLink to="/" style={navLinkStyle}>
                <HomeOutlined /> Trang chủ
              </NavLink>
            </li>

            <li className="nav-item mx-2">
              <NavLink to="/booking" style={navLinkStyle}>
                <CalendarOutlined /> Đặt sân
              </NavLink>
            </li>

            <li className="nav-item mx-2">
              <NavLink to="/contact" style={navLinkStyle}>
                <PhoneOutlined /> Liên hệ
              </NavLink>
            </li>

            <li className="nav-item mx-2">
              <NavLink to="/matchmaking" style={navLinkStyle}>
                <TeamOutlined /> Ghép đối
              </NavLink>
            </li>
            {isLoggedIn && (
              <li className="nav-item mx-2">
                <NavLink to="/ai" style={navLinkStyle}>
                  <span style={{ fontSize: 16 }}>🤖</span> AI gợi ý
                </NavLink>
              </li>
            )}
          </ul>

          {/* Search */}
          <div className="d-flex me-3">
            <style>{`
              .header-search input::placeholder { color: rgba(255,255,255,0.7) !important; }
              .header-search input { color: #fff !important; }
            `}</style>

            <Search
              className="header-search"
              placeholder="Tìm sân..."
              size="middle"
              allowClear
              onSearch={(q) => q && message.info(`Tìm: ${q}`)}
              style={{ width: 240 }}
            />
          </div>

          {/* Right side */}
          {!isLoggedIn ? (
            <Space size={10} className="align-items-center">
              <Button
                onClick={() => navigate("/login")}
                icon={<LoginOutlined />}
                style={{
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.10)",
                  borderColor: "rgba(255,255,255,0.20)",
                  color: "white",
                }}
              >
                Đăng nhập
              </Button>
            </Space>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Avatar
                  size={38}
                  style={{
                    backgroundColor: "#38a169",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {displayName?.trim()?.[0]?.toUpperCase?.() || (
                    <UserOutlined />
                  )}
                </Avatar>
              </Dropdown>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;