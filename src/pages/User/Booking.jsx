import React from "react";
import { Tabs, Typography } from "antd";
import FieldBookingTab from "../../components/User/FieldBookingTab";
import OtherLayout from "../../layouts/OtherLayout";
import "animate.css/animate.css";

const { Title, Text } = Typography;

const Booking = () => {
  return (
    <OtherLayout>
      <div
        className="py-5"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,.10), transparent 55%), radial-gradient(1000px 650px at 90% 10%, rgba(16,185,129,.10), transparent 55%), linear-gradient(to bottom, #f8f9fa, #eef2ff)",
        }}
      >
        <div className="container-fluid">
          <div className="text-center mb-4 animate__animated animate__fadeInDown">
            <Title level={2} style={{ marginBottom: 6, color: "#1a365d" }}>
              Đặt sân bóng
            </Title>
            <Text style={{ color: "#6c757d", fontSize: 16 }}>
              Chọn sân phù hợp, xem khung giờ trống và đặt sân nhanh chóng trên hệ thống.
            </Text>
          </div>

          <div
            className="animate__animated animate__fadeIn"
            style={{
              borderRadius: 18,
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.08)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: 14,
            }}
          >
            <Tabs
              centered
              items={[
                {
                  key: "1",
                  label: "Chọn sân và khung giờ",
                  children: <FieldBookingTab />,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </OtherLayout>
  );
};

export default Booking;