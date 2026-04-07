import nodemailer from "nodemailer";
import { db } from "../db";
import { smtpConfigTable } from "../db/schema/smtp_config";
import { eq } from "drizzle-orm";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private currentConfigId: number | null = null;

  async initializeTransporter() {
    try {
      const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.isActive, true)).limit(1);

      if (!config) {
        console.warn("No active SMTP configuration found. Email sending disabled.");
        return false;
      }

      this.currentConfigId = config.id;
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize email transporter:", error);
      return false;
    }
  }

  async sendOTP(email: string, otp: string, recipientName: string = "User"): Promise<boolean> {
    try {
      // Initialize transporter if not already done
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized || !this.transporter) {
          console.error("Email service not configured");
          return false;
        }
      }

      const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, this.currentConfigId!)).limit(1);

      if (!config) {
        console.error("SMTP configuration not found");
        return false;
      }

      const mailOptions = {
        from: `${config.fromName || "Tree Tracking System"} <${config.fromEmail}>`,
        to: email,
        subject: "Your OTP for Tree Tracking System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2ecc71; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Tree Tracking System</h2>
            </div>
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 16px;">Hello ${recipientName},</p>
              <p style="color: #666; font-size: 14px;">You have requested to verify your account. Your One-Time Password (OTP) is:</p>
              <div style="background-color: #ffffff; border: 2px solid #2ecc71; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #2ecc71; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</p>
              </div>
              <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                If you did not request this OTP, please ignore this email.
              </p>
            </div>
          </div>
        `,
        text: `Your OTP for Tree Tracking System is: ${otp}. This OTP is valid for 10 minutes.`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return false;
    }
  }

  async sendTestEmail(testEmail: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized || !this.transporter) {
          console.error("Email service not configured");
          return false;
        }
      }

      const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, this.currentConfigId!)).limit(1);

      if (!config) {
        console.error("SMTP configuration not found");
        return false;
      }

      const mailOptions = {
        from: `${config.fromName || "Tree Tracking System"} <${config.fromEmail}>`,
        to: testEmail,
        subject: "SMTP Configuration Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3498db; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Test Email</h2>
            </div>
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 16px;">SMTP Configuration is working successfully!</p>
              <p style="color: #666; font-size: 14px;">This is a test email to verify your SMTP configuration.</p>
              <div style="background-color: #ffffff; border: 1px solid #3498db; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Provider:</strong> ${config.provider}</p>
                <p style="margin: 5px 0;"><strong>Host:</strong> ${config.host}</p>
                <p style="margin: 5px 0;"><strong>Port:</strong> ${config.port}</p>
                <p style="margin: 5px 0;"><strong>From Email:</strong> ${config.fromEmail}</p>
              </div>
            </div>
          </div>
        `,
        text: "SMTP Configuration is working successfully!",
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Test email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Failed to send test email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized || !this.transporter) {
          return false;
        }
      }

      await this.transporter.verify();
      console.log("SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("SMTP connection verification failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
