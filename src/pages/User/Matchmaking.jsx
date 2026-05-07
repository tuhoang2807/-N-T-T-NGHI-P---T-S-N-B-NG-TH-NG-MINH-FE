import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext.jsx";
import OtherLayout from "../../layouts/OtherLayout";
import { matchmakingApi } from "./../../services/api/matchmakingApi.js";
import { matchChatSocket } from "./../../services/api/matchChatSocket.js";

const { Title, Text } = Typography;

const formatDateVN = (isoOrDate) => {
  if (!isoOrDate) return "—";
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return String(isoOrDate);
  }
};

const formatTime = (t) => t || "—";
const safe = (v, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : v;

const normalizePost = (raw) => {
  if (!raw) return null;

  const applicants = Array.isArray(raw.applicants)
    ? raw.applicants.map((a) => ({
        id: a.id ?? a.userId ?? a.applicantUserId,
        name: a.name ?? a.fullName ?? a.applicantName,
        avatarUrl: a.avatarUrl ?? a.avatar ?? null,
        message: a.message ?? a.note ?? "",
        status: a.status ?? "PENDING",
      }))
    : [];

  return {
    id: raw.id,
    status: raw.status,
    note: raw.note ?? "",
    pendingCount: raw.pendingCount ?? 0,

    booking: {
      fieldName: raw.fieldName,
      fieldType: raw.fieldType,
      description: raw.fieldDescription ?? null,
      dateISO: raw.date,
      start: raw.start,
      end: raw.end,
      price: raw.price,
      bookingId: raw.bookingId,
      fieldId: raw.fieldId,
    },

    owner: {
      id: raw.ownerId,
      name: raw.ownerName,
      avatarUrl: raw.ownerAvatarUrl ?? null,
    },

    matchedUser:
      raw.matchedUserId || raw.matchedUserName
        ? {
            id: raw.matchedUserId,
            name: raw.matchedUserName,
            avatarUrl: null,
          }
        : null,

    applicants,
  };
};

export default function Matchmaking() {
  const { user, isLoggedIn } = useAuth();
  const userId = useMemo(() => user?.userId ?? user?.id ?? null, [user]);

  const [posts, setPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [q, setQ] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [openApply, setOpenApply] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    bookingId: "",
    title: "",
    note: "",
  });

  const [openChat, setOpenChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatByPost, setChatByPost] = useState({});
  const activeChatPostIdRef = useRef(null);
  const [wsStatus, setWsStatus] = useState("DISCONNECTED");
  const lastSentRef = useRef(null);

  const isOwner = (post) => {
    if (!post) return false;
    if (!isLoggedIn || !userId) return false;
    return post.owner?.id === userId;
  };

  // ===== TIME HELPERS =====
  const parseDateTime = (dateISO, timeStr) => {
    if (!dateISO || !timeStr) return null;
    const normalizedTime = String(timeStr).length === 5 ? `${timeStr}:00` : timeStr;
    const dt = new Date(`${dateISO}T${normalizedTime}`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const getStartAt = (post) => parseDateTime(post?.booking?.dateISO, post?.booking?.start);
  const getEndAt = (post) => parseDateTime(post?.booking?.dateISO, post?.booking?.end);

  const isExpiredPost = (post) => {
    if (!post) return true;
    if (post.status === "EXPIRED" || post.status === "DELETED") return true;

    const now = new Date();
    const startAt = getStartAt(post);
    const endAt = getEndAt(post);

    if (post.status === "OPEN") {
      return startAt ? now >= startAt : false;
    }

    if (post.status === "MATCHED") {
      return endAt ? now > endAt : false;
    }

    return false;
  };

  const isTooCloseToStart = (post) => {
    if (!post) return false;
    const startAt = getStartAt(post);
    if (!startAt) return false;
    const now = new Date();
    const diffMs = startAt.getTime() - now.getTime();
    return diffMs <= 30 * 60 * 1000; // <= 30 phút
  };

  const canApplyUI = (post) => {
    return (
      !!post &&
      post.status === "OPEN" &&
      !isExpiredPost(post) &&
      !isTooCloseToStart(post)
    );
  };

  const canChooseUI = (post) => {
    return (
      !!post &&
      post.status === "OPEN" &&
      !isExpiredPost(post) &&
      !isTooCloseToStart(post)
    );
  };

  const canOpenChatUI = (post) => {
    return !!post && post.status === "MATCHED" && !isExpiredPost(post);
  };

  const loadPosts = async () => {
    setLoadingList(true);
    try {
      const res = await matchmakingApi.listAll();
      const arr = Array.isArray(res.data) ? res.data : [];
      setPosts(arr.map(normalizePost).filter(Boolean));
    } catch (e) {
      message.error(e?.message || "Không tải được danh sách kèo ghép đối");
      setPosts([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    const key = (q || "").trim().toLowerCase();

    const visiblePosts = posts.filter(
      (p) => p.status !== "EXPIRED" && p.status !== "DELETED" && !isExpiredPost(p)
    );

    if (!key) return visiblePosts;

    return visiblePosts.filter((p) => {
      const s = `${p.booking?.fieldName ?? ""} ${p.booking?.fieldType ?? ""} ${
        p.booking?.description ?? ""
      } ${p.note ?? ""} ${p.owner?.name ?? ""}`.toLowerCase();
      return s.includes(key);
    });
  }, [posts, q]);

  const openPostDetail = async (post) => {
    setOpenDetail(true);
    setSelected(null);
    setLoadingDetail(true);

    try {
      const res = await matchmakingApi.getDetail(post.id);
      setSelected(normalizePost(res.data));
    } catch (e) {
      message.error(e?.message || "Không tải được chi tiết kèo");
      setSelected(post);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenApply = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập để ứng tuyển");
      return;
    }
    if (!canApplyUI(selected)) {
      message.warning("Bài đăng này không còn nhận ứng tuyển.");
      return;
    }
    setApplyMsg("");
    setOpenApply(true);
  };

  const submitApply = async () => {
    if (!selected) return;
    if (!canApplyUI(selected)) {
      message.warning("Bài đăng này không còn nhận ứng tuyển.");
      setOpenApply(false);
      return;
    }

    try {
      await matchmakingApi.apply(selected.id, { message: applyMsg });
      message.success("Ứng tuyển thành công ✅");
      setOpenApply(false);

      await loadPosts();

      const detailRes = await matchmakingApi.getDetail(selected.id);
      setSelected(normalizePost(detailRes.data));
    } catch (e) {
      message.error(e?.message || "Ứng tuyển thất bại");
    }
  };

  const acceptApplicant = async (app) => {
    if (!selected) return;
    if (!canChooseUI(selected)) {
      message.info("Bài đăng này không còn cho phép chọn đối thủ.");
      return;
    }

    try {
      await matchmakingApi.chooseOpponent(selected.id, app.id);
      message.success(`Đã ghép với ${app.name} ✅`);

      await loadPosts();

      const detailRes = await matchmakingApi.getDetail(selected.id);
      setSelected(normalizePost(detailRes.data));
    } catch (e) {
      message.error(e?.message || "Ghép đối thất bại");
    }
  };

  const rejectApplicant = () => {
    message.info(
      "Backend chưa có API từ chối riêng. (Chỉ khi chọn đối thủ thì tự reject người còn lại)"
    );
  };

  const randomPick = async () => {
    if (!selected) return;
    if (!canChooseUI(selected)) {
      message.warning("Bài đăng này không còn cho phép chọn đối thủ.");
      return;
    }

    const pending = (selected.applicants || []).filter((a) => a.status === "PENDING");
    if (!pending.length) {
      message.warning("Không có ứng viên nào đang chờ.");
      return;
    }
    const pick = pending[Math.floor(Math.random() * pending.length)];
    await acceptApplicant(pick);
  };

  const openCreateModal = () => {
    if (!isLoggedIn) {
      message.warning("Bạn cần đăng nhập để đăng kèo");
      return;
    }
    setCreateForm({ bookingId: "", title: "", note: "" });
    setOpenCreate(true);
  };

  const submitCreate = async () => {
    const bookingId = String(createForm.bookingId || "").trim();
    if (!bookingId) {
      message.warning("Vui lòng nhập bookingId");
      return;
    }

    setCreating(true);
    try {
      const res = await matchmakingApi.create({
        bookingId: Number(bookingId),
        title: createForm.title?.trim() || null,
        note: createForm.note?.trim() || null,
      });

      message.success("Đăng kèo thành công ✅");
      setOpenCreate(false);

      await loadPosts();

      const newId = res?.data?.id;
      if (newId) {
        await openPostDetail({ id: newId });
      }
    } catch (e) {
      message.error(e?.message || "Đăng kèo thất bại");
    } finally {
      setCreating(false);
    }
  };

  const getChatMessages = (postId) => {
    if (!postId) return [];
    return chatByPost[String(postId)] || [];
  };

  const appendChatMessage = (postId, msg) => {
    const key = String(postId);
    setChatByPost((prev) => {
      const cur = prev[key] || [];
      return { ...prev, [key]: [...cur, msg] };
    });
  };

  const clearChat = () => {
    if (!selected?.id) return;
    const key = String(selected.id);
    setChatByPost((prev) => ({ ...prev, [key]: [] }));
  };

  const openChatRoom = () => {
    if (!selected?.id) return;

    if (!canOpenChatUI(selected)) {
      message.warning("Chat không còn khả dụng cho bài này.");
      return;
    }

    const postId = selected.id;
    activeChatPostIdRef.current = postId;
    setWsStatus("CONNECTING");

    matchChatSocket.connect(postId, (msg) => {
      const mapped = {
        fromUserId: msg.fromUserId ?? null,
        name: msg.fromName || "Đối thủ",
        avatarUrl: msg.fromAvatarUrl || null,
        content: msg.content || "",
        sentAt: msg.sentAt || new Date().toISOString(),
      };

      const ls = lastSentRef.current;
      if (
        ls &&
        String(ls.postId) === String(postId) &&
        ls.content === mapped.content &&
        Date.now() - ls.at < 2000
      ) {
        return;
      }

      appendChatMessage(postId, mapped);
      setWsStatus("CONNECTED");
    });

    setOpenChat(true);
  };

  const sendChat = () => {
    const content = (chatInput || "").trim();
    if (!content || !selected?.id) return;

    if (!canOpenChatUI(selected)) {
      message.warning("Chat không còn khả dụng cho bài này.");
      return;
    }

    const localMsg = {
      fromUserId: userId ?? -1,
      name: "Bạn",
      avatarUrl: null,
      content,
      sentAt: new Date().toISOString(),
      __local: true,
    };
    appendChatMessage(selected.id, localMsg);

    lastSentRef.current = { postId: selected.id, content, at: Date.now() };

    const ok = matchChatSocket.send(selected.id, content);
    if (!ok) {
      message.warning("WebSocket chưa kết nối xong, thử lại sau 1-2 giây.");
      return;
    }
    setChatInput("");
  };

  const closeChat = () => {
    matchChatSocket.disconnect();
    setWsStatus("DISCONNECTED");
    setOpenChat(false);
  };

  useEffect(() => {
    return () => {
      matchChatSocket.disconnect();
    };
  }, []);

  const chatMessages = selected?.id ? getChatMessages(selected.id) : [];
  const selectedExpired = isExpiredPost(selected);
  const selectedTooClose = isTooCloseToStart(selected);

  return (
    <OtherLayout>
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <TeamOutlined /> Ghép đối
            </Title>
            <Text type="secondary">
              Đặt sân → đăng kèo → người khác ứng tuyển → chủ kèo chọn đối thủ.
            </Text>
          </div>

          <Space wrap>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo sân / loại sân / người đăng..."
              allowClear
              style={{ width: 320 }}
            />
            <Button icon={<ReloadOutlined />} onClick={loadPosts} loading={loadingList}>
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={!isLoggedIn}
            >
              Đăng kèo
            </Button>
          </Space>
        </div>

        <Divider />

        {filtered.length === 0 ? (
          <Empty description={loadingList ? "Đang tải..." : "Chưa có kèo ghép đối nào"} />
        ) : (
          <List
            loading={loadingList}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2 }}
            dataSource={filtered}
            renderItem={(p) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => openPostDetail(p)}
                  title={
                    <Space>
                      <Tag
                        color={
                          p.status === "OPEN"
                            ? "green"
                            : p.status === "MATCHED"
                            ? "blue"
                            : "default"
                        }
                      >
                        {p.status}
                      </Tag>
                      <Text strong>{safe(p.booking?.fieldName)}</Text>
                    </Space>
                  }
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPostDetail(p);
                      }}
                    >
                      Xem
                    </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{safe(p.booking?.description)}</Text>
                    </Space>

                    <Space>
                      <CalendarOutlined />
                      <Text>{p.booking?.dateISO ? formatDateVN(p.booking.dateISO) : "—"}</Text>
                    </Space>

                    <Space>
                      <ClockCircleOutlined />
                      <Text>
                        {formatTime(p.booking?.start)} - {formatTime(p.booking?.end)} •{" "}
                        {safe(p.booking?.fieldType)}
                      </Text>
                    </Space>

                    {isTooCloseToStart(p) && p.status === "OPEN" ? (
                      <Tag color="orange">Đã quá sát giờ để ghép đối</Tag>
                    ) : null}

                    <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                      <Space>
                        <Avatar icon={<UserOutlined />} src={p.owner?.avatarUrl || null} />
                        <Text>{safe(p.owner?.name)}</Text>
                      </Space>

                      <Badge count={p.pendingCount ?? 0} showZero>
                        <Tag>Ứng viên</Tag>
                      </Badge>
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}

        <Drawer
          title="Chi tiết kèo ghép đối"
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          width={520}
        >
          {loadingDetail && !selected ? (
            <Empty description="Đang tải..." />
          ) : !selected ? (
            <Empty />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size={10}>
              <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                <Space>
                  <Tag
                    color={
                      selected.status === "OPEN"
                        ? "green"
                        : selected.status === "MATCHED"
                        ? "blue"
                        : selected.status === "EXPIRED"
                        ? "red"
                        : "default"
                    }
                  >
                    {selectedExpired ? "EXPIRED" : selected.status}
                  </Tag>
                  <Text strong>{safe(selected.booking?.fieldName)}</Text>
                </Space>

                {canOpenChatUI(selected) ? (
                  <Button icon={<MessageOutlined />} onClick={openChatRoom}>
                    Chat
                  </Button>
                ) : null}
              </Space>

              <Text type="secondary">{selected.note || "—"}</Text>

              <Divider style={{ margin: "10px 0" }} />

              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <EnvironmentOutlined /> <Text>{safe(selected.booking?.description)}</Text>
                </Space>
                <Space>
                  <CalendarOutlined />{" "}
                  <Text>
                    {selected.booking?.dateISO ? formatDateVN(selected.booking.dateISO) : "—"}
                  </Text>
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  <Text>
                    {formatTime(selected.booking?.start)} - {formatTime(selected.booking?.end)} •{" "}
                    {safe(selected.booking?.fieldType)}
                  </Text>
                </Space>
              </Space>

              {selectedExpired ? (
                <Tag color="red">Bài đăng đã hết hiệu lực</Tag>
              ) : selectedTooClose && selected.status === "OPEN" ? (
                <Tag color="orange">Đã quá sát giờ, không thể tiếp tục ghép đối</Tag>
              ) : null}

              <Divider style={{ margin: "10px 0" }} />

              {selected.status === "OPEN" ? (
                isOwner(selected) ? (
                  <Space>
                    <Button
                      icon={<ThunderboltOutlined />}
                      onClick={randomPick}
                      disabled={!canChooseUI(selected)}
                    >
                      Random
                    </Button>
                  </Space>
                ) : (
                  <Button type="primary" onClick={handleOpenApply} disabled={!canApplyUI(selected)}>
                    Ứng tuyển
                  </Button>
                )
              ) : selected.matchedUser ? (
                <Tag color="blue">Đã ghép với: {safe(selected.matchedUser?.name)}</Tag>
              ) : null}

              {isOwner(selected) ? (
                <>
                  <Divider />
                  <Title level={5} style={{ marginTop: 0 }}>
                    Danh sách ứng viên
                  </Title>

                  {(selected.applicants || []).length === 0 ? (
                    <Empty description="Chưa có ai ứng tuyển" />
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={selected.applicants}
                      renderItem={(a) => (
                        <List.Item
                          actions={
                            selected.status !== "OPEN" || !canChooseUI(selected)
                              ? [<Tag key="st">{a.status}</Tag>]
                              : a.status === "PENDING"
                              ? [
                                  <Button
                                    key="acc"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => acceptApplicant(a)}
                                  >
                                    Chọn
                                  </Button>,
                                  <Button
                                    key="rej"
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => rejectApplicant(a)}
                                  >
                                    Từ chối
                                  </Button>,
                                ]
                              : [<Tag key="st">{a.status}</Tag>]
                          }
                        >
                          <List.Item.Meta
                            avatar={<Avatar src={a.avatarUrl || null} icon={<UserOutlined />} />}
                            title={
                              <Space>
                                <Text strong>{safe(a.name)}</Text>
                                <Tag>{a.status}</Tag>
                              </Space>
                            }
                            description={a.message || "—"}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </>
              ) : null}
            </Space>
          )}
        </Drawer>

        <Modal
          title="Ứng tuyển kèo"
          open={openApply}
          onCancel={() => setOpenApply(false)}
          onOk={submitApply}
          okText="Gửi"
        >
          <Text type="secondary">Nhập lời nhắn (tuỳ chọn)</Text>
          <Input.TextArea
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
            rows={4}
            placeholder="VD: Team mình 5 người, đá fair-play, kèo giao lưu..."
            style={{ marginTop: 10 }}
          />
        </Modal>

        <Modal
          title="Đăng kèo ghép đối"
          open={openCreate}
          onCancel={() => setOpenCreate(false)}
          onOk={submitCreate}
          okText="Đăng"
          confirmLoading={creating}
        >
          <Text type="secondary">
            Nhập <b>bookingId</b> của đơn đặt sân mà bạn muốn đăng ghép đối.
          </Text>

          <Divider style={{ margin: "12px 0" }} />

          <Space direction="vertical" style={{ width: "100%" }} size={10}>
            <div>
              <Text strong>Booking ID</Text>
              <Input
                value={createForm.bookingId}
                onChange={(e) => setCreateForm((p) => ({ ...p, bookingId: e.target.value }))}
                placeholder="VD: 123"
              />
            </div>

            <div>
              <Text strong>Tiêu đề (tuỳ chọn)</Text>
              <Input
                value={createForm.title}
                onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="VD: Cần đội đá giao lưu sân 7"
              />
            </div>

            <div>
              <Text strong>Ghi chú (tuỳ chọn)</Text>
              <Input.TextArea
                rows={4}
                value={createForm.note}
                onChange={(e) => setCreateForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="VD: Kèo vui vẻ, đá fair-play, áo sáng màu..."
              />
            </div>
          </Space>
        </Modal>

        <Drawer title="Chat với đối thủ" open={openChat} onClose={closeChat} width={520}>
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
              <Tag color={wsStatus === "CONNECTED" ? "green" : wsStatus === "CONNECTING" ? "orange" : "default"}>
                {wsStatus === "CONNECTED"
                  ? "Đã kết nối"
                  : wsStatus === "CONNECTING"
                  ? "Đang kết nối..."
                  : "Chưa kết nối"}
              </Tag>

              <Button icon={<DeleteOutlined />} danger onClick={clearChat}>
                Xoá chat (UI)
              </Button>
            </Space>

            <div
              style={{
                height: 380,
                overflow: "auto",
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 12,
              }}
            >
              {chatMessages.length === 0 ? (
                <Empty description="Chưa có tin nhắn" />
              ) : (
                chatMessages.map((m, i) => {
                  const mine =
                    m.__local === true ||
                    (m.fromUserId != null &&
                      userId != null &&
                      Number(m.fromUserId) === Number(userId));

                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: 10,
                        textAlign: mine ? "right" : "left",
                      }}
                    >
                      <Tag color={mine ? "green" : "blue"}>
                        {mine ? "Bạn" : safe(m.name, "Đối thủ")}
                      </Tag>
                      <Text style={{ marginLeft: 6 }}>{m.content}</Text>
                    </div>
                  );
                })
              )}
            </div>

            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onPressEnter={sendChat}
              />
              <Button type="primary" onClick={sendChat}>
                Gửi
              </Button>
            </Space.Compact>

            <Text type="secondary">Chat tồn tại trong 24h kể từ khi ghép đối.</Text>
          </Space>
        </Drawer>
      </div>
    </OtherLayout>
  );
}