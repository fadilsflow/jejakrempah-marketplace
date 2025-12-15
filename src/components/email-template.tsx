import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  message,
  actionLabel,
  actionUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", lineHeight: "1.5" }}>
    <h1>Hello, {firstName}!</h1>
    <p>{message}</p>
    <div style={{ marginTop: "20px", marginBottom: "20px" }}>
      <a
        href={actionUrl}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: "10px 20px",
          textDecoration: "none",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        {actionLabel}
      </a>
    </div>
    <p style={{ fontSize: "14px", color: "#666" }}>
      Or copy and paste this link into your browser: <br />
      <a href={actionUrl}>{actionUrl}</a>
    </p>
  </div>
);
