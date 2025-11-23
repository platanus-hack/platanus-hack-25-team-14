"use client";

import { useQuery } from "@apollo/client";
import { gql } from "../../../gql";
import {
  Card,
  Typography,
  Alert,
  Spin,
  Space,
  Tag,
  Button,
  Descriptions,
} from "antd";
import {
  FileTextOutlined,
  MedicineBoxOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { LogoLoading } from "../../../components/FancyLoading";

dayjs.locale("es");

export const dynamic = "force-dynamic";

const { Title, Text } = Typography;

const GET_EXAM = gql(`
  query GetExam($id: String!) {
    exam(id: $id) {
      id
      title
      fileKey
      status
      createdAt
      downloadUrl
    }
  }
`);

export default function SharePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, loading, error } = useQuery(GET_EXAM, {
    variables: { id },
    errorPolicy: "all",
    fetchPolicy: "network-only",
  });

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY [a las] HH:mm");
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "Pendiente";
      case "PROCESSING":
        return "Procesando";
      case "READY":
        return "Listo";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "orange";
      case "PROCESSING":
        return "blue";
      case "READY":
        return "green";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LogoLoading />;
  }

  if (error || !data?.exam) {
    return (
      <div
        style={{
          padding: "3rem",
          maxWidth: "800px",
          margin: "0 auto",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Alert
          message="Documento no encontrado"
          description={
            error
              ? error.message
              : "El documento que está buscando no existe o ya no está disponible."
          }
          type="error"
          showIcon
          style={{ fontSize: "18px" }}
        />
      </div>
    );
  }

  const exam = data.exam;
  const isPrescription = exam.title.toLowerCase().includes("receta");

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "100vh",
        fontSize: "18px",
      }}
    >
      <Card
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            {isPrescription ? (
              <MedicineBoxOutlined
                style={{ fontSize: "64px", color: "#00b96b", marginBottom: "1rem" }}
              />
            ) : (
              <FileTextOutlined
                style={{ fontSize: "64px", color: "#1890ff", marginBottom: "1rem" }}
              />
            )}
            <Title level={2} style={{ marginBottom: "0.5rem" }}>
              {exam.title}
            </Title>
            <Tag
              color={getStatusColor(exam.status)}
              style={{ fontSize: "18px", padding: "6px 16px" }}
            >
              {getStatusLabel(exam.status)}
            </Tag>
          </div>

          <Descriptions
            bordered
            column={1}
            size="default"
            style={{ fontSize: "18px" }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined />
                  <Text strong>Fecha</Text>
                </Space>
              }
            >
              {formatDate(exam.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <FileTextOutlined />
                  <Text strong>Tipo de Documento</Text>
                </Space>
              }
            >
              {exam.title}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Text strong>Estado</Text>
              }
            >
              <Tag
                color={getStatusColor(exam.status)}
                style={{ fontSize: "16px", padding: "4px 12px" }}
              >
                {getStatusLabel(exam.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              href={exam.downloadUrl}
              target="_blank"
              style={{
                height: "60px",
                fontSize: "20px",
                padding: "0 3rem",
                minWidth: "250px",
              }}
            >
              Ver Documento
            </Button>
          </div>

          <Alert
            message="Información importante"
            description="Este documento médico es confidencial. Por favor, no comparta este enlace con personas no autorizadas."
            type="info"
            showIcon
            style={{ fontSize: "16px", marginTop: "1rem" }}
          />
        </Space>
      </Card>
    </div>
  );
}
