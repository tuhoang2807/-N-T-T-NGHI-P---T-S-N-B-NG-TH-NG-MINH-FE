import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Segmented,
  Tag,
  Space,
  Typography,
  Empty,
  Spin,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "animate.css/animate.css";
import { useNavigate } from "react-router-dom";
import { fieldApi } from "../../services/api/filed.api";

const { Text } = Typography;

const UI_TYPES = ["Sân 5", "Sân 7", "Sân 11"];
const UI_TO_ENUM = {
  "Sân 5": "FIVE",
  "Sân 7": "SEVEN",
  "Sân 11": "ELEVEN",
};

const enumToUITag = (t) => {
  if (t === "FIVE") return "Sân 5";
  if (t === "SEVEN") return "Sân 7";
  if (t === "ELEVEN") return "Sân 11";
  return t;
};

const DEFAULT_FIELD_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80";

const FieldBookingTab = () => {
  const navigate = useNavigate();

  const [activeType, setActiveType] = useState("Sân 7");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldsData, setFieldsData] = useState([]);

  useEffect(() => {
    const fetchByType = async () => {
      const enumType = UI_TO_ENUM[activeType] || "SEVEN";
      setLoading(true);
      try {
        const res = await fieldApi.getByType(enumType);
        const list = res?.data?.data ?? [];
        setFieldsData(Array.isArray(list) ? list : []);
      } catch (e) {
        const apiMsg = e?.response?.data?.message || e?.message;
        message.error(apiMsg || "Không tải được danh sách sân");
        setFieldsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchByType();
  }, [activeType]);

  const normalized = useMemo(() => {
    return (fieldsData || []).map((f) => {
      const priceValue = Number(f?.pricePerSlot ?? 0);
      const priceText = `${priceValue.toLocaleString("vi-VN")}đ/giờ`;

      const isActive = f?.status === "ACTIVE";

      return {
        id: f.fieldId,
        name: f.fieldName,
        type: enumToUITag(f.type),
        isActive,
        availability: isActive ? "Đang hoạt động" : "Không hoạt động",
        priceValue,
        priceText,
        image:
          f.imageUrl && f.imageUrl.trim()
            ? f.imageUrl
            : DEFAULT_FIELD_IMAGE,
      };
    });
  }, [fieldsData]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();

    return normalized.filter((f) => {
      if (!k) return true;
      return (
        (f.name || "").toLowerCase().includes(k) ||
        (f.availability || "").toLowerCase().includes(k) ||
        (f.type || "").toLowerCase().includes(k)
      );
    });
  }, [normalized, keyword]);

  const StatusTag = ({ isActive }) =>
    isActive ? (
      <Tag
        icon={<CheckCircleOutlined />}
        color="green"
        style={{ borderRadius: 999, margin: 0 }}
      >
        HOẠT ĐỘNG
      </Tag>
    ) : (
      <Tag
        icon={<CloseCircleOutlined />}
        color="red"
        style={{ borderRadius: 999, margin: 0 }}
      >
        KHÔNG HOẠT ĐỘNG
      </Tag>
    );

  const Cover = ({ src, alt }) => (
    <div style={{ position: "relative" }}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_FIELD_IMAGE;
        }}
        style={{
          height: 190,
          width: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );

  const handleGoDetail = (field) => {
    if (!field?.isActive) {
      message.error("Sân không hoạt động");
      return;
    }
    navigate(`/fields/${field.id}`);
  };

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} md={7} lg={6}>
        <Card
          className="border-0 shadow-sm animate__animated animate__fadeInLeft"
          style={{ borderRadius: 16, background: "white" }}
          styles={{ body: { padding: 16 } }}
        >
          <div
            style={{
              fontWeight: 900,
              color: "#1a365d",
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            Bộ lọc nhanh
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: "#6c757d" }}>Loại sân</Text>
            <div style={{ marginTop: 8 }}>
              <Segmented
                block
                options={UI_TYPES}
                value={activeType}
                onChange={setActiveType}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text style={{ color: "#6c757d" }}>Tìm kiếm</Text>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tên sân / trạng thái..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ borderRadius: 12, marginTop: 8 }}
              allowClear
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} md={17} lg={18}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16, borderRadius: 12, fontWeight: 700 }}
        >
          Quay lại
        </Button>

        {loading ? (
          <Card
            className="border-0 shadow-sm"
            style={{ borderRadius: 16 }}
            styles={{ body: { padding: 24 } }}
          >
            <Space>
              <Spin />
              <Text>Đang tải danh sách sân...</Text>
            </Space>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.length === 0 ? (
              <Col xs={24}>
                <Card
                  className="border-0 shadow-sm"
                  style={{ borderRadius: 16 }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Empty description="Không có sân phù hợp. Thử đổi loại sân hoặc từ khóa nhé." />
                </Card>
              </Col>
            ) : (
              filtered.map((field, idx) => (
                <Col
                  xs={24}
                  md={12}
                  lg={8}
                  key={field.id}
                  className="animate__animated animate__fadeInUp"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <Card
                    hoverable
                    className="border-0 shadow-sm"
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      height: "100%",
                    }}
                    styles={{ body: { padding: 14 } }}
                    cover={<Cover src={field.image} alt={field.name} />}
                  >
                    <div
                      className="d-flex justify-content-between align-items-start"
                      style={{ gap: 10 }}
                    >
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 15,
                          color: "#111827",
                        }}
                      >
                        {field.name}
                      </div>
                      <StatusTag isActive={field.isActive} />
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      {field.availability}
                    </div>

                    <Button
                      type="primary"
                      block
                      style={{
                        borderRadius: 12,
                        marginTop: 14,
                        fontWeight: 800,
                      }}
                      onClick={() => handleGoDetail(field)}
                    >
                      Chi tiết <ArrowRightOutlined className="ms-2" />
                    </Button>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};

export default FieldBookingTab;