import React from "react";
import { ConfigProvider } from "antd";
import locale from "antd/locale/es_ES";
import { ApolloWrapper } from "../components/ApolloWrapper";
import { LayoutContent } from "../components/LayoutContent";
import "../styles/globals.css";

// Define el tema médico (Azul/Turquesa limpio)
const theme = {
  token: {
    colorPrimary: "#00b96b", // Puedes cambiar esto por tu color corporativo
    borderRadius: 6,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ApolloWrapper>
          <ConfigProvider theme={theme} locale={locale}>
            <LayoutContent>{children}</LayoutContent>
          </ConfigProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
