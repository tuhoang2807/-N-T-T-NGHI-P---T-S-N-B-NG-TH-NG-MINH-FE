import React, { useMemo } from "react";
import { Row, Col, Card, Calendar, Badge, Typography, Tag } from "antd";
import { FireOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "animate.css/animate.css";

const { Text } = Typography;

const BookingCalendarTab = () => {
  // Mock events “có vẻ thật” hơn: dựa theo ngày chẵn/lẻ cho demo
  const getCalendarEvents = useMemo(() => {
    return (date) => {
      const d = date.date();
      if (d % 2 === 0) {
        return [
          { content: "Sân 1 Trống 18:00", type: "success" },
          { content: "Sân 7 Hot 20:00", type: "error" },
        ];
      }
      return [{ content: "Sân VIP Đặt 19:00", type: "error" }];
    };
  }, []);

  const dateCellRender = (date) => {
    const events = getCalendarEvents(date);
    return (
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {events.slice(0, 2).map((event, index) => (
          <li key={index} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <Badge status={event.type} text={event.content} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Row justify="center">
      <Col xs={24}>
        <Card
          className="border-0 shadow-sm animate__animated animate__fadeIn"
          style={{ borderRadius: 16 }}
          styles={{ body: { padding: 16 } }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#1a365d" }}>Lịch đặt sân</div>
              <Text style={{ color: "#6c757d" }}>Xem nhanh các slot trống/hot theo ngày.</Text>
            </div>
            <div className="d-flex gap-2">
              <Tag icon={<CheckCircleOutlined />} color="green" style={{ borderRadius: 999 }}>
                Trống
              </Tag>
              <Tag icon={<FireOutlined />} color="red" style={{ borderRadius: 999 }}>
                Hot/Đã đặt
              </Tag>
            </div>
          </div>

          <Calendar
            dateCellRender={dateCellRender}
            style={{
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default BookingCalendarTab;
