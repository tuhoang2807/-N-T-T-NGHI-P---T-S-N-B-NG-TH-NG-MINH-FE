import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Button,
  Avatar,
  Form,
  Input,
  message,
  Typography,
  Space,
  Tag,
  Divider,
  Tooltip,
  ConfigProvider,
  Skeleton,
  Spin,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  CloseOutlined,
  TeamOutlined,
  CopyOutlined,
  CrownOutlined,
  CheckCircleFilled,
  DollarCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import OtherLayout from "../../layouts/OtherLayout";
import "animate.css/animate.css";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../services/api/user.api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AUTH_KEY = "auth";

const formatVND = (n) => {
  const x = Number(n);
  return (Number.isFinite(x) ? x : 0).toLocaleString("vi-VN") + "đ";
};

const cx = {
  text: "#0B1220",
  sub: "rgba(11, 18, 32, 0.62)",
  soft: "rgba(11, 18, 32, 0.10)",
  softer: "rgba(11, 18, 32, 0.06)",
  glass: "rgba(255,255,255,0.70)",
  rXL: 28,
  rLG: 22,
};

const GradientBorder = ({ radius = 22, style, children }) => (
  <div
    style={{
      borderRadius: radius,
      padding: 1,
      background:
        "linear-gradient(135deg, rgba(59,130,246,0.42), rgba(99,102,241,0.30), rgba(236,72,153,0.26), rgba(255,255,255,0.22))",
      ...style,
    }}
  >
    <div
      style={{
        borderRadius: radius - 1,
        background: cx.glass,
        backdropFilter: "blur(14px)",
        border: `1px solid ${cx.softer}`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </div>
);

const Field = ({ label, value, icon, action }) => (
  <div style={{ padding: "10px 0" }}>
    <div style={{ fontSize: 12, color: cx.sub, marginBottom: 6 }}>
      <Space size={8}>
        {icon}
        <span>{label}</span>
      </Space>
    </div>
    <Row justify="space-between" align="middle" wrap={false}>
      <div
        style={{
          fontSize: 15,
          color: cx.text,
          fontWeight: 650,
          lineHeight: 1.35,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          paddingRight: 10,
        }}
        title={value ?? "-"}
      >
        {value ?? "-"}
      </div>
      {action}
    </Row>
  </div>
);

const getApiErrorMessage = (err) => {
  const m1 = err?.response?.data?.message;
  const m2 = err?.message;
  const m3 = err?.data?.message;
  const m4 = err?.response?.data?.error;
  const m5 = typeof err?.response?.data === "string" ? err.response.data : null;
  return m1 || m3 || m2 || m4 || m5 || null;
};

const getInitial = (name) => {
  const clean = String(name || "").trim();
  return clean ? clean.charAt(0).toUpperCase() : null;
};

const getTeamName = (u) =>
  u?.teamName ||
  u?.team?.teamName ||
  u?.team?.name ||
  u?.footballTeam?.name ||
  null;

const getTeamLeaderName = (u) =>
  u?.teamLeaderName ||
  u?.captainName ||
  u?.teamCaptainName ||
  u?.team?.leaderName ||
  u?.team?.captainName ||
  u?.footballTeam?.captainName ||
  null;

const getTeamRole = (u) => {
  if (u?.isCaptain === true || u?.isTeamLeader === true) return "Đội trưởng";
  return (
    u?.teamRole ||
    u?.roleInTeam ||
    u?.team?.myRole ||
    u?.footballTeam?.myRole ||
    (getTeamName(u) ? "Thành viên" : null)
  );
};

const getTeamCode = (u) =>
  u?.teamCode ||
  u?.team?.teamCode ||
  u?.team?.code ||
  u?.footballTeam?.code ||
  null;

const getTeamMemberCount = (u) => {
  const raw =
    u?.teamMemberCount ||
    u?.team?.memberCount ||
    u?.team?.totalMembers ||
    u?.footballTeam?.memberCount;
  return raw ?? null;
};

export default function Profile() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [coin, setCoin] = useState(0);
  const [loadingCoin, setLoadingCoin] = useState(false);

  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  const userId = auth?.user?.userId;

  const displayName = useMemo(() => me?.fullName || "Tài khoản", [me]);
  const avatarLetter = useMemo(() => getInitial(displayName), [displayName]);

  const teamName = useMemo(() => getTeamName(me), [me]);
  const teamLeaderName = useMemo(() => getTeamLeaderName(me), [me]);
  const teamRole = useMemo(() => getTeamRole(me), [me]);
  const teamCode = useMemo(() => getTeamCode(me), [me]);
  const teamMemberCount = useMemo(() => getTeamMemberCount(me), [me]);
  const isCaptain = useMemo(() => teamRole === "Đội trưởng", [teamRole]);

  const fetchCoin = async () => {
    if (!userId) return;

    setLoadingCoin(true);
    try {
      const res = await userApi.getCoins(userId);

      const coinValue =
        res?.data?.data?.data ??
        res?.data?.data ??
        res?.data ??
        0;

      const n = Number(coinValue ?? 0);
      setCoin(Number.isFinite(n) ? n : 0);
    } catch (e) {
      const apiMsg = getApiErrorMessage(e);
      message.error(apiMsg || "Không lấy được số dư coin");
      setCoin(0);
    } finally {
      setLoadingCoin(false);
    }
  };

  const fetchMe = async () => {
    if (!userId) {
      message.warning("Bạn cần đăng nhập để xem hồ sơ");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.getById(userId);
      const data = res?.data?.data;

      setMe(data || null);

      form.setFieldsValue({
        name: data?.fullName || "",
        email: data?.email || "",
        phone: data?.phone || "",
        bio: data?.address || "",
      });
    } catch (e) {
      const apiMsg = getApiErrorMessage(e);
      message.error(apiMsg || "Không tải được thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchCoin();
  }, [userId]);

  const enterEdit = () => {
    setEditMode(true);
    form.setFieldsValue({
      name: me?.fullName || "",
      email: me?.email || "",
      phone: me?.phone || "",
      bio: me?.address || "",
    });
  };

  const handleSave = async () => {
    if (!userId) {
      message.warning("Bạn cần đăng nhập để sửa hồ sơ");
      navigate("/login");
      return;
    }

    try {
      const values = await form.validateFields();

      const payload = {
        fullName: values.name?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        address: values.bio?.trim() || null,
      };

      const res = await userApi.update(userId, payload);
      const updated = res?.data?.data;

      if (!updated) {
        message.success(res?.data?.message || "Cập nhật xong");
        setEditMode(false);
        return;
      }

      setMe(updated);
      setEditMode(false);

      form.setFieldsValue({
        name: updated?.fullName || "",
        email: updated?.email || "",
        phone: updated?.phone || "",
        bio: updated?.address || "",
      });

      try {
        const raw = localStorage.getItem(AUTH_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.user) {
          parsed.user = { ...parsed.user, ...updated };
          localStorage.setItem(AUTH_KEY, JSON.stringify(parsed));
        }
      } catch {}

      message.success(res?.data?.message || "Cập nhật thông tin thành công!");
    } catch (e) {
      if (e?.errorFields) {
        message.error("Thông tin nhập chưa hợp lệ");
        return;
      }
      const apiMsg = getApiErrorMessage(e);
      message.error(apiMsg || "Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditMode(false);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Đã copy!");
    } catch {
      message.error("Copy thất bại!");
    }
  };

  const theme = {
    token: {
      colorPrimary: "#3B82F6",
      borderRadius: 14,
      fontSize: 14,
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
      colorText: cx.text,
      colorTextSecondary: cx.sub,
      colorBorder: cx.softer,
      controlHeight: 42,
    },
    components: {
      Button: {
        borderRadius: 14,
        controlHeight: 42,
        fontWeight: 650,
      },
      Card: {
        borderRadiusLG: 22,
        paddingLG: 18,
      },
      Input: {
        borderRadius: 14,
        controlHeight: 42,
      },
      Tag: {
        borderRadiusSM: 999,
      },
      Divider: {
        colorSplit: cx.soft,
      },
    },
  };

  const displayCreatedAt = useMemo(() => {
    if (!me?.createdAt) return null;
    const d = new Date(me.createdAt);
    if (Number.isNaN(d.getTime())) return me.createdAt;
    return d.toLocaleString();
  }, [me?.createdAt]);

  return (
    <OtherLayout>
      <ConfigProvider theme={theme}>
        <style>{`
          .fx-card { transition: transform .18s ease, box-shadow .18s ease; }
          .fx-card:hover { transform: translateY(-2px); box-shadow: 0 22px 70px rgba(2,6,23,.12); }
          .fx-soft { transition: transform .16s ease, background .16s ease; }
          .fx-soft:hover { transform: translateY(-1px); background: rgba(255,255,255,.78); }
          .fx-ring:focus-within { box-shadow: 0 0 0 6px rgba(59,130,246,.14); border-color: rgba(59,130,246,.35)!important; }
          .fx-btn { transition: transform .16s ease, box-shadow .16s ease; }
          .fx-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(2,6,23,.14); }
          .fx-sheen { position: relative; overflow: hidden; }
          .fx-sheen:before {
            content:"";
            position:absolute; inset:-2px;
            background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.22), transparent 70%);
            transform: translateX(-60%);
            transition: transform .7s ease;
            pointer-events:none;
          }
          .fx-sheen:hover:before { transform: translateX(60%); }
          .sticky { position: sticky; top: 18px; }
        `}</style>

        <div
          style={{
            minHeight: "100vh",
            padding: "56px 14px",
            background:
              "radial-gradient(1200px 520px at 18% 4%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(900px 420px at 82% 0%, rgba(236,72,153,0.14), transparent 55%), linear-gradient(180deg, #f8fafc, #eef2ff 55%, #f8fafc)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <GradientBorder radius={cx.rXL} style={{ boxShadow: "0 30px 120px rgba(2,6,23,.14)" }}>
              {/* HERO */}
              <div
                className="fx-sheen"
                style={{
                  padding: 26,
                  background:
                    "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(99,102,241,0.88), rgba(236,72,153,0.74))",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(560px 240px at 18% 35%, rgba(255,255,255,0.32), transparent 60%), radial-gradient(720px 280px at 78% 15%, rgba(255,255,255,0.18), transparent 65%)",
                    pointerEvents: "none",
                  }}
                />

                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                  <Col>
                    <Space direction="vertical" size={6}>
                      <Space size={8} wrap>
                        <Tag
                          icon={<CrownOutlined />}
                          style={{
                            borderRadius: 999,
                            paddingInline: 12,
                            paddingBlock: 6,
                            border: "1px solid rgba(255,255,255,0.45)",
                            background: "rgba(255,255,255,0.16)",
                            color: "rgba(255,255,255,0.95)",
                          }}
                        >
                          Profile
                        </Tag>
                        <Tag
                          icon={<CheckCircleFilled />}
                          style={{
                            borderRadius: 999,
                            paddingInline: 12,
                            paddingBlock: 6,
                            border: "1px solid rgba(255,255,255,0.45)",
                            background: "rgba(255,255,255,0.16)",
                            color: "rgba(255,255,255,0.95)",
                          }}
                        >
                          Verified
                        </Tag>
                      </Space>

                      <Title level={3} style={{ margin: 0, color: "white", letterSpacing: -0.2 }}>
                        Hồ sơ cá nhân
                      </Title>
                      <Text style={{ color: "rgba(255,255,255,0.86)" }}>
                        Thông tin • Đội • Bảo mật
                      </Text>
                    </Space>
                  </Col>

                  <Col>
                    <Space>
                      {editMode ? (
                        <>
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            className="fx-btn"
                            style={{
                              borderRadius: 14,
                              height: 42,
                              paddingInline: 18,
                              boxShadow: "0 16px 28px rgba(2,6,23,0.22)",
                            }}
                          >
                            Lưu thay đổi
                          </Button>
                          <Button
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                            className="fx-btn"
                            style={{
                              borderRadius: 14,
                              height: 42,
                              paddingInline: 18,
                              background: "rgba(255,255,255,0.18)",
                              borderColor: "rgba(255,255,255,0.35)",
                              color: "white",
                            }}
                          >
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={enterEdit}
                          className="fx-btn"
                          style={{
                            borderRadius: 14,
                            height: 42,
                            paddingInline: 18,
                            boxShadow: "0 16px 28px rgba(2,6,23,0.22)",
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          fetchMe();
                          fetchCoin();
                        }}
                        className="fx-btn"
                        style={{
                          borderRadius: 14,
                          height: 42,
                          paddingInline: 16,
                          background: "rgba(255,255,255,0.18)",
                          borderColor: "rgba(255,255,255,0.35)",
                          color: "white",
                        }}
                      >
                        Tải lại
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </div>

              {/* CONTENT */}
              <div style={{ padding: 22 }}>
                <Row gutter={[16, 16]} align="stretch">
                  {/* LEFT */}
                  <Col xs={24} lg={8}>
                    <div className="sticky">
                      <GradientBorder radius={cx.rLG} style={{ boxShadow: "0 18px 60px rgba(2,6,23,.10)" }}>
                        <div style={{ padding: 16 }}>
                          {loading ? (
                            <Skeleton active avatar paragraph={{ rows: 4 }} />
                          ) : (
                            <>
                              <Row align="middle" gutter={[12, 12]}>
                                <Col flex="none">
                                  <div style={{ position: "relative", width: 96, height: 96 }}>
                                    <Avatar
                                      size={96}
                                      style={{
                                        backgroundColor: "#38a169",
                                        color: "white",
                                        fontWeight: 800,
                                        fontSize: 34,
                                        border: "4px solid rgba(255,255,255,0.95)",
                                        boxShadow: "0 18px 55px rgba(2, 6, 23, 0.20)",
                                        userSelect: "none",
                                      }}
                                      icon={!avatarLetter ? <UserOutlined /> : null}
                                    >
                                      {avatarLetter || null}
                                    </Avatar>
                                  </div>
                                </Col>

                                <Col flex="auto" style={{ minWidth: 0 }}>
                                  <Title level={4} style={{ margin: 0, color: cx.text, letterSpacing: -0.2 }}>
                                    {me?.fullName || "-"}
                                  </Title>
                                  <Text style={{ color: cx.sub }}>{me?.email || "-"}</Text>

                                  <div style={{ marginTop: 10 }}>
                                    <Space size={8} wrap>
                                      <Tag style={{ borderRadius: 999 }}>
                                        Loyalty {me?.loyaltyPoints ?? 0}
                                      </Tag>
                                      <Tag color={me?.isActive ? "green" : "red"} style={{ borderRadius: 999 }}>
                                        {me?.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
                                      </Tag>
                                      {teamRole ? (
                                        <Tag
                                          color={isCaptain ? "gold" : "geekblue"}
                                          icon={isCaptain ? <CrownOutlined /> : <TeamOutlined />}
                                          style={{ borderRadius: 999 }}
                                        >
                                          {teamRole}
                                        </Tag>
                                      ) : null}
                                    </Space>
                                  </div>
                                </Col>
                              </Row>

                              <Divider style={{ margin: "14px 0" }} />

                              <div
                                className="fx-soft"
                                style={{
                                  borderRadius: 18,
                                  border: `1px solid ${cx.soft}`,
                                  background: "rgba(255,255,255,0.68)",
                                  padding: 14,
                                }}
                              >
                                <Row justify="space-between" align="middle">
                                  <Space size={10}>
                                    <div
                                      style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 12,
                                        display: "grid",
                                        placeItems: "center",
                                        border: `1px solid ${cx.soft}`,
                                        background:
                                          "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.65))",
                                      }}
                                    >
                                      <DollarCircleOutlined />
                                    </div>
                                    <div>
                                      <Text style={{ color: cx.sub, fontSize: 12 }}>Số dư coin</Text>
                                      <div style={{ fontWeight: 900, color: cx.text, fontSize: 18 }}>
                                        {loadingCoin ? <Spin size="small" /> : formatVND(coin)}
                                      </div>
                                    </div>
                                  </Space>

                                  <Tooltip title="Tải lại coin">
                                    <Button icon={<ReloadOutlined />} onClick={fetchCoin} style={{ borderRadius: 14 }} />
                                  </Tooltip>
                                </Row>

                                <Divider style={{ margin: "12px 0" }} />

                                <Button
                                  type="primary"
                                  block
                                  icon={<DollarCircleOutlined />}
                                  className="fx-btn"
                                  onClick={() => navigate("/wallet/topup")}
                                  style={{
                                    borderRadius: 14,
                                    height: 42,
                                    fontWeight: 800,
                                    background:
                                      "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
                                    border: "none",
                                    boxShadow: "0 14px 30px rgba(99,102,241,0.22)",
                                  }}
                                >
                                  Nạp tiền
                                </Button>

                                <Text style={{ display: "block", marginTop: 10, color: cx.sub, fontSize: 12 }}>
                                  Coin được lấy từ server (luôn chính xác).
                                </Text>
                              </div>

                              <Divider style={{ margin: "14px 0" }} />

                              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                                <Button
                                  block
                                  icon={<CopyOutlined />}
                                  onClick={() => copy(me?.email || "")}
                                  className="fx-btn"
                                  style={{ borderRadius: 14, height: 42 }}
                                >
                                  Copy email
                                </Button>

                                {displayCreatedAt && (
                                  <div
                                    className="fx-soft"
                                    style={{
                                      borderRadius: 16,
                                      border: `1px solid ${cx.soft}`,
                                      background: "rgba(255,255,255,0.68)",
                                      padding: 12,
                                    }}
                                  >
                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Ngày tạo</Text>
                                    <div style={{ fontWeight: 750, color: cx.text }}>{displayCreatedAt}</div>
                                  </div>
                                )}
                              </Space>
                            </>
                          )}
                        </div>
                      </GradientBorder>
                    </div>
                  </Col>

                  {/* RIGHT */}
                  <Col xs={24} lg={16}>
                    <Row gutter={[16, 16]}>
                      {/* PERSONAL */}
                      <Col xs={24}>
                        <GradientBorder radius={cx.rLG} style={{ boxShadow: "0 18px 60px rgba(2,6,23,.10)" }}>
                          <div className="fx-card fx-ring" style={{ padding: 18, border: `1px solid ${cx.softer}` }}>
                            <Row justify="space-between" align="middle" gutter={[10, 10]}>
                              <Col>
                                <Space align="center" size={10}>
                                  <div
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 12,
                                      display: "grid",
                                      placeItems: "center",
                                      border: `1px solid ${cx.soft}`,
                                      background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.65))",
                                    }}
                                  >
                                    <UserOutlined />
                                  </div>
                                  <div>
                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Personal</Text>
                                    <div style={{ fontSize: 16, fontWeight: 750, color: cx.text, letterSpacing: -0.2 }}>
                                      Thông tin cá nhân
                                    </div>
                                  </div>
                                </Space>
                              </Col>
                            </Row>

                            <Divider style={{ margin: "14px 0" }} />

                            {loading ? (
                              <Skeleton active paragraph={{ rows: 6 }} />
                            ) : editMode ? (
                              <Form form={form} layout="vertical">
                                <Row gutter={[12, 12]}>
                                  <Col xs={24}>
                                    <Form.Item
                                      label="Họ và tên"
                                      name="name"
                                      rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                                    >
                                      <Input
                                        size="large"
                                        prefix={<UserOutlined />}
                                        placeholder="Nhập họ tên"
                                        style={{ borderRadius: 14 }}
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} md={12}>
                                    <Form.Item
                                      label="Email"
                                      name="email"
                                      rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}
                                    >
                                      <Input
                                        size="large"
                                        prefix={<MailOutlined />}
                                        placeholder="Nhập email"
                                        style={{ borderRadius: 14 }}
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24} md={12}>
                                    <Form.Item
                                      label="Số điện thoại"
                                      name="phone"
                                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                                    >
                                      <Input
                                        size="large"
                                        prefix={<PhoneOutlined />}
                                        placeholder="Nhập số điện thoại"
                                        style={{ borderRadius: 14 }}
                                      />
                                    </Form.Item>
                                  </Col>

                                  <Col xs={24}>
                                    <Form.Item label="Địa chỉ" name="bio">
                                      <TextArea rows={3} placeholder="Nhập địa chỉ..." style={{ borderRadius: 14 }} />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Form>
                            ) : (
                              <div>
                                <Field label="Họ và tên" value={me?.fullName} icon={<UserOutlined style={{ color: cx.sub }} />} />
                                <Divider style={{ margin: "12px 0" }} />
                                <Row gutter={[12, 12]}>
                                  <Col xs={24} md={12}>
                                    <Field
                                      label="Email"
                                      value={me?.email}
                                      icon={<MailOutlined style={{ color: cx.sub }} />}
                                      action={
                                        <Tooltip title="Copy">
                                          <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => copy(me?.email || "")}
                                            style={{ borderRadius: 12 }}
                                          />
                                        </Tooltip>
                                      }
                                    />
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <Field
                                      label="Số điện thoại"
                                      value={me?.phone}
                                      icon={<PhoneOutlined style={{ color: cx.sub }} />}
                                    />
                                  </Col>
                                </Row>
                                <Divider style={{ margin: "12px 0" }} />
                                <div style={{ paddingTop: 2 }}>
                                  <div style={{ fontSize: 12, color: cx.sub, marginBottom: 6 }}>Địa chỉ</div>
                                  <Text style={{ color: cx.sub }}>{me?.address || "Chưa cập nhật"}</Text>
                                </div>
                              </div>
                            )}
                          </div>
                        </GradientBorder>
                      </Col>

                      {/* TEAM */}
                      <Col xs={24}>
                        <GradientBorder radius={cx.rLG} style={{ boxShadow: "0 18px 60px rgba(2,6,23,.10)" }}>
                          <div className="fx-card" style={{ padding: 18 }}>
                            <Row justify="space-between" align="middle" gutter={[10, 10]}>
                              <Col>
                                <Space align="center" size={10}>
                                  <div
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 12,
                                      display: "grid",
                                      placeItems: "center",
                                      border: `1px solid ${cx.soft}`,
                                      background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.65))",
                                    }}
                                  >
                                    <TeamOutlined />
                                  </div>
                                  <div>
                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Team</Text>
                                    <div style={{ fontSize: 16, fontWeight: 750, color: cx.text, letterSpacing: -0.2 }}>
                                      Thông tin đội
                                    </div>
                                  </div>
                                </Space>
                              </Col>

                              <Col>
                                <Space wrap>
                                  <Tag color="geekblue" style={{ borderRadius: 999 }}>
                                    {teamName || "Chưa có đội"}
                                  </Tag>
                                  {teamRole ? (
                                    <Tag
                                      color={isCaptain ? "gold" : "cyan"}
                                      icon={isCaptain ? <CrownOutlined /> : <TeamOutlined />}
                                      style={{ borderRadius: 999 }}
                                    >
                                      {teamRole}
                                    </Tag>
                                  ) : null}
                                </Space>
                              </Col>
                            </Row>

                            <Divider style={{ margin: "14px 0" }} />

                            {loading ? (
                              <Skeleton active paragraph={{ rows: 3 }} />
                            ) : (
                              <Row gutter={[12, 12]}>
                                <Col xs={24} md={12}>
                                  <div
                                    className="fx-soft"
                                    style={{
                                      borderRadius: 20,
                                      padding: 16,
                                      border: "1px solid rgba(59,130,246,0.18)",
                                      background:
                                        "linear-gradient(180deg, rgba(59,130,246,0.10), rgba(255,255,255,0.78))",
                                      height: "100%",
                                    }}
                                  >
                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Tên đội</Text>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: cx.text, letterSpacing: -0.2 }}>
                                      {teamName || "-"}
                                    </div>

                                    <Divider style={{ margin: "12px 0" }} />

                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Đội trưởng</Text>
                                    <div style={{ fontSize: 14, fontWeight: 650, color: cx.text }}>
                                      {teamLeaderName || "-"}
                                    </div>

                                    <Divider style={{ margin: "12px 0" }} />

                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Vai trò của bạn</Text>
                                    <div style={{ fontSize: 14, fontWeight: 650, color: cx.text }}>
                                      {teamRole || "-"}
                                    </div>
                                  </div>
                                </Col>

                                <Col xs={24} md={12}>
                                  <div
                                    className="fx-soft"
                                    style={{
                                      borderRadius: 20,
                                      padding: 16,
                                      border: `1px solid ${cx.soft}`,
                                      background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.62))",
                                      height: "100%",
                                    }}
                                  >
                                    <Text style={{ color: cx.sub, fontSize: 12 }}>Thông tin bổ sung</Text>

                                    <div style={{ marginTop: 12 }}>
                                      <Field
                                        label="Mã đội"
                                        value={teamCode || "Chưa có"}
                                        icon={<TeamOutlined style={{ color: cx.sub }} />}
                                      />
                                      <Divider style={{ margin: "12px 0" }} />
                                      <Field
                                        label="Số thành viên"
                                        value={
                                          teamMemberCount !== null && teamMemberCount !== undefined
                                            ? `${teamMemberCount} thành viên`
                                            : "Chưa có dữ liệu"
                                        }
                                        icon={<UserOutlined style={{ color: cx.sub }} />}
                                      />
                                      <Divider style={{ margin: "12px 0" }} />
                                      <Field
                                        label="Trạng thái đội"
                                        value={teamName ? "Đang tham gia đội" : "Chưa tham gia đội nào"}
                                        icon={<CheckCircleFilled style={{ color: cx.sub }} />}
                                      />
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            )}
                          </div>
                        </GradientBorder>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </GradientBorder>
          </div>
        </div>
      </ConfigProvider>
    </OtherLayout>
  );
}