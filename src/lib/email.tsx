import React from "react";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  text,
  react,
}: {
  to: string;
  subject: string;
  text: string;
  react?: React.ReactNode;
}) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    console.log("📨 Mock Email Information:");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Jejak Rempah <onboarding@webtron.biz.id>", // TODO: Replace with your verified domain
      to,
      subject,
      text,
      react,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendVerificationEmail = async ({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) => {
  console.log("🔗 Verification Link:", url); // Log for debugging
  await sendEmail({
    to,
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,
    react: (
      <EmailTemplate
        firstName={name}
        message="Please define your email address by clicking the button below."
        actionLabel="Verify Email"
        actionUrl={url}
      />
    ),
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) => {
  console.log("🔗 Password Reset Link:", url); // Log for debugging
  await sendEmail({
    to,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,
    react: (
      <EmailTemplate
        firstName={name}
        message="You requested a password reset. Click the button below to reset your password."
        actionLabel="Reset Password"
        actionUrl={url}
      />
    ),
  });
};
