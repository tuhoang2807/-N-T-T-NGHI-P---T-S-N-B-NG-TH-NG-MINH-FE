import React, { useEffect, useMemo, useState } from "react";
import { recommendationApi } from "../../services/api/recommendationApi";
import { useNavigate } from "react-router-dom";
import OtherLayout from "../../layouts/OtherLayout";
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Typography,
  Space,
  Spin,
  Empty,
  message,
} from "antd";
import {
  ThunderboltOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function getDowLabel(date) {
  try {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 ? "Chủ nhật" : `Thứ ${day + 1}`;
  } catch {
    return "";
  }
}

const AiRecommendationPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // TODO: sau này lấy từ AuthContext
  const userId = 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await recommendationApi.getQuickBook(userId, {
        days: 7,
        topK: 5,
      });

      setData(res.data?.data || []);
    } catch (e) {
      console.error(e);
      message.error("Không tải được gợi ý AI");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (item) => {
    if (!item?.fieldId || !item?.slotId || !item?.bookingDate) {
      message.warning("Dữ liệu gợi ý không hợp lệ");
      return;
    }

    navigate("/booking/confirm", {
      state: {
        fieldId: item.fieldId,
        slotId: item.slotId,
        date: item.bookingDate,
      },
    });
  };

  const titleRight = useMemo(() => {
    return (
      <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
        Làm mới
      </Button>
    );
  }, [loading]);

  return (
    <OtherLayout>
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={2}>
              <Title level={3} style={{ margin: 0 }}>
                🤖 AI gợi ý thông minh
              </Title>
              <Text type="secondary">
                Hệ thống đề xuất sân và khung giờ phù hợp dựa trên lịch sử đặt
                sân của bạn.
              </Text>
            </Space>
          </Col>

          <Col>{titleRight}</Col>
        </Row>

        <div style={{ marginTop: 20 }}>
          <Spin spinning={loading}>
            {!loading && data.length === 0 ? (
              <Card style={{ borderRadius: 14 }}>
                <Empty description="Chưa có gợi ý AI cho bạn" />

                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Button icon={<ReloadOutlined />} onClick={loadData}>
                    Thử lại
                  </Button>
                </div>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {data.map((item, index) => {
                  const dow = getDowLabel(item.bookingDate);

                  const timeRange =
                    item.slotStart && item.slotEnd
                      ? `${item.slotStart} - ${item.slotEnd}`
                      : "--";

                  return (
                    <Col key={index} xs={24} sm={12} lg={8}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 16,
                          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Space
                          direction="vertical"
                          size={10}
                          style={{ width: "100%" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <Title level={5} style={{ margin: 0 }}>
                                {item.fieldName || `Sân #${item.fieldId}`}
                              </Title>

                              <Text type="secondary">
                                {item.fieldType
                                  ? `Loại sân: ${item.fieldType}`
                                  : ""}
                              </Text>
                            </div>

                            {item.score && (
                              <Tag color="green">
                                AI {item.score.toFixed(2)}
                              </Tag>
                            )}
                          </div>

                          <div
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: "rgba(56,161,105,0.08)",
                              border: "1px solid rgba(56,161,105,0.2)",
                            }}
                          >
                            <Space direction="vertical">
                              <Space>
                                <CalendarOutlined />

                                <Text strong>
                                  {dow} • {item.bookingDate}
                                </Text>
                              </Space>

                              <Text>
                                Khung giờ: <Text strong>{timeRange}</Text>
                                {item.slotNumber && (
                                  <Text type="secondary">
                                    {" "}
                                    (Slot #{item.slotNumber})
                                  </Text>
                                )}
                              </Text>
                            </Space>
                          </div>

                          <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            block
                            style={{
                              height: 40,
                              borderRadius: 10,
                              background: "#38a169",
                            }}
                            onClick={() => handleBook(item)}
                          >
                            Đặt ngay
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>
        </div>
      </div>
    </OtherLayout>
  );
};

export default AiRecommendationPage;
