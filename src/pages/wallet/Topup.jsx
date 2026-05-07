import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Form,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DollarCircleOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import OtherLayout from "../../layouts/OtherLayout";
import { useNavigate } from "react-router-dom";
import { paymentApi } from "../../services/api/payment.api";

const { Title, Text } = Typography;

const AUTH_KEY = "auth";
const formatVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

// helper lấy message lỗi an toàn
const getApiErrorMessage = (err) => {
  const m1 = err?.response?.data?.message;
  const m2 = err?.message;
  const m3 = err?.response?.data?.return_message;
  const m4 = err?.response?.data?.error;
  const m5 = typeof err?.response?.data === "string" ? err.response.data : null;
  return m1 || m3 || m2 || m4 || m5 || null;
};

export default function Topup() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  const userId = auth?.user?.userId;

  const quickAmounts = [20000, 50000, 100000, 200000, 500000];

  const onCreatePayment = async () => {
    if (!userId) {
      message.warning("Bạn cần đăng nhập để nạp tiền");
      navigate("/login");
      return;
    }

    try {
      const values = await form.validateFields();
      const amount = Number(values.amount);

      setLoading(true);

      const payload = {
        amount,
        userId: String(userId),
        description: `Nap coin user ${userId} - ${formatVND(amount)}`,
      };

      const res = await paymentApi.createZaloPayOrder(payload);

      // res?.data có thể là raw Map từ BE hoặc BE bọc { data: ... }
      const raw = res?.data?.data ?? res?.data;

      console.log("CREATE ZLP RESPONSE:", res);
      console.log("CREATE ZLP RAW:", raw);

      if (!raw) {
        message.error("Không có dữ liệu trả về từ BE");
        return;
      }

      // ✅ đọc cả snake_case (BE đang trả) và camelCase (fallback)
      const returnCode = raw?.return_code ?? raw?.returnCode;
      const returnMessage = raw?.return_message ?? raw?.returnMessage;

      const subReturnCode = raw?.sub_return_code ?? raw?.subReturnCode;
      const subReturnMessage = raw?.sub_return_message ?? raw?.subReturnMessage;

      // URL: ưu tiên cashier_order_url (dễ mở), fallback order_url
      const payUrl =
        raw?.order_url ??
        raw?.cashier_order_url ??
        raw?.cashierOrderUrl;
        

      if (returnCode !== 1) {
        message.error(
          `Tạo đơn thất bại: code=${returnCode ?? "?"} | sub=${
            subReturnCode ?? "-"
          } | ${subReturnMessage || returnMessage || "Không có message"}`
        );
        return;
      }

      if (!payUrl) {
        message.error("Tạo đơn OK nhưng thiếu URL thanh toán (order_url)");
        console.log("ZLP OK BUT NO URL:", raw);
        return;
      }

      message.success("Tạo đơn thành công! Đang chuyển tới ZaloPay...");
      window.location.href = payUrl;
    } catch (e) {
      if (e?.errorFields) {
        message.error("Vui lòng nhập số tiền hợp lệ");
        return;
      }
      const apiMsg = getApiErrorMessage(e);
      message.error(apiMsg || "Có lỗi khi tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OtherLayout>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3B82F6",
            borderRadius: 14,
            controlHeight: 42,
          },
          components: { Card: { borderRadiusLG: 22 } },
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            padding: "56px 14px",
            background:
              "linear-gradient(180deg, #f8fafc, #eef2ff 55%, #f8fafc)",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={14}>
                <Card
                  style={{
                    borderRadius: 22,
                    boxShadow: "0 22px 70px rgba(2,6,23,.10)",
                  }}
                >
                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    <Space align="center" size={10}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          border: "1px solid rgba(2,6,23,.08)",
                          background: "rgba(255,255,255,.9)",
                        }}
                      >
                        <DollarCircleOutlined />
                      </div>
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          Nạp tiền (ZaloPay Sandbox)
                        </Title>
                        <Text type="secondary">
                          Tạo đơn thanh toán và chuyển sang ZaloPay để hoàn tất.
                        </Text>
                      </div>
                    </Space>

                    <Divider style={{ margin: "14px 0" }} />

                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={{ amount: 50000 }}
                    >
                      <Form.Item
                        label="Số tiền muốn nạp"
                        name="amount"
                        rules={[
                          { required: true, message: "Vui lòng nhập số tiền" },
                          {
                            validator: (_, v) => {
                              const n = Number(v);
                              if (!Number.isFinite(n)) {
                                return Promise.reject(
                                  new Error("Số tiền không hợp lệ")
                                );
                              }
                              if (n < 10000) {
                                return Promise.reject(
                                  new Error("Tối thiểu 10.000đ")
                                );
                              }
                              if (n > 10000000) {
                                return Promise.reject(
                                  new Error("Tối đa 10.000.000đ")
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={10000}
                          step={10000}
                          formatter={(v) => formatVND(v)}
                          parser={(v) => String(v || "").replace(/[^\d]/g, "")}
                        />
                      </Form.Item>

                      <div style={{ marginBottom: 10 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Chọn nhanh:
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Space wrap>
                            {quickAmounts.map((a) => (
                              <Tag
                                key={a}
                                style={{
                                  cursor: "pointer",
                                  borderRadius: 999,
                                  paddingInline: 12,
                                  paddingBlock: 6,
                                }}
                                onClick={() => form.setFieldValue("amount", a)}
                              >
                                {formatVND(a)}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        block
                        icon={<ArrowRightOutlined />}
                        onClick={onCreatePayment}
                        loading={loading}
                        style={{
                          height: 44,
                          borderRadius: 14,
                          fontWeight: 800,
                          boxShadow: "0 16px 30px rgba(59,130,246,.22)",
                        }}
                      >
                        Tạo thanh toán ZaloPay
                      </Button>

                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          marginTop: 10,
                          fontSize: 12,
                        }}
                      >
                        Đây là sandbox: tiền không trừ thật. Trạng thái đơn sẽ
                        được xác nhận qua callback server.
                      </Text>
                    </Form>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={10}>
                <Card
                  style={{
                    borderRadius: 22,
                    boxShadow: "0 22px 70px rgba(2,6,23,.08)",
                  }}
                >
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Space align="center" size={10}>
                      <SafetyOutlined />
                      <Text style={{ fontWeight: 700 }}>Lưu ý quan trọng</Text>
                    </Space>

                    <Text type="secondary">
                      1) App chỉ coi là nạp thành công khi server nhận{" "}
                      <b>callback</b> hợp lệ.
                    </Text>
                    <Text type="secondary">
                      2) Callback URL phải public (ngrok / deploy).
                    </Text>
                    <Text type="secondary">
                      3) Nếu bạn muốn “cộng coin”, hãy cộng ở BE sau khi verify
                      callback.
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </ConfigProvider>
    </OtherLayout>
  );
}
