import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, smtpConfigTable } from "../db";
import { emailService } from "../lib/email";

const router: IRouter = Router();

// GET /api/admin/smtp - Get all SMTP configurations
router.get("/admin/smtp", async (_req, res): Promise<void> => {
  try {
    const configs = await db.select().from(smtpConfigTable).orderBy(smtpConfigTable.createdAt);

    // Remove sensitive data from response
    const safeConfigs = configs.map(config => ({
      ...config,
      password: config.password ? "***hidden***" : null,
    }));

    res.json({ configs: safeConfigs, total: configs.length });
  } catch (error) {
    console.error("Error fetching SMTP configs:", error);
    res.status(500).json({ error: "Failed to fetch SMTP configurations" });
  }
});

// GET /api/admin/smtp/:id - Get specific SMTP configuration
router.get("/admin/smtp/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);

    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Remove password from response
    const safeConfig = {
      ...config,
      password: config.password ? "***hidden***" : null,
    };

    res.json({ config: safeConfig });
  } catch (error) {
    console.error("Error fetching SMTP config:", error);
    res.status(500).json({ error: "Failed to fetch SMTP configuration" });
  }
});

// POST /api/admin/smtp - Create new SMTP configuration
router.post("/admin/smtp", async (req, res): Promise<void> => {
  try {
    const { name, provider, host, port, secure, username, password, fromEmail, fromName } = req.body as Record<string, any>;

    // Validate required fields
    if (!name?.trim() || !provider?.trim() || !host?.trim() || !port || !username?.trim() || !password?.trim() || !fromEmail?.trim()) {
      res.status(400).json({ 
        error: "Missing required fields: name, provider, host, port, username, password, fromEmail" 
      });
      return;
    }

    // Check if name already exists
    const existing = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.name, name.trim())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An SMTP configuration with this name already exists." });
      return;
    }

    const [newConfig] = await db.insert(smtpConfigTable).values({
      name: name.trim(),
      provider: provider.trim(),
      host: host.trim(),
      port: parseInt(port),
      secure: secure !== false,
      username: username.trim(),
      password: password.trim(),
      fromEmail: fromEmail.trim(),
      fromName: fromName?.trim() || "Tree Tracking System",
      isActive: false,
    }).returning();

    const safeConfig = {
      ...newConfig,
      password: "***hidden***",
    };

    res.status(201).json({ config: safeConfig });
  } catch (error) {
    console.error("Error creating SMTP config:", error);
    res.status(500).json({ error: "Failed to create SMTP configuration" });
  }
});

// PUT /api/admin/smtp/:id - Update SMTP configuration
router.put("/admin/smtp/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const { name, provider, host, port, secure, username, password, fromEmail, fromName, isActive } = req.body as Record<string, any>;

    // Check if config exists
    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);
    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Check if name is being changed and already exists
    if (name && name.trim() !== config.name) {
      const existing = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.name, name.trim())).limit(1);
      if (existing.length > 0) {
        res.status(409).json({ error: "An SMTP configuration with this name already exists." });
        return;
      }
    }

    // If activating this config, deactivate others
    if (isActive === true && !config.isActive) {
      await db.update(smtpConfigTable).set({ isActive: false }).where(eq(smtpConfigTable.isActive, true));
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (provider) updateData.provider = provider.trim();
    if (host) updateData.host = host.trim();
    if (port) updateData.port = parseInt(port);
    if (secure !== undefined) updateData.secure = secure !== false;
    if (username) updateData.username = username.trim();
    if (password) updateData.password = password.trim();
    if (fromEmail) updateData.fromEmail = fromEmail.trim();
    if (fromName) updateData.fromName = fromName.trim();
    if (isActive !== undefined) updateData.isActive = isActive === true;

    updateData.updatedAt = new Date();

    const [updated] = await db.update(smtpConfigTable).set(updateData).where(eq(smtpConfigTable.id, id)).returning();

    const safeConfig = {
      ...updated,
      password: "***hidden***",
    };

    res.json({ config: safeConfig });
  } catch (error) {
    console.error("Error updating SMTP config:", error);
    res.status(500).json({ error: "Failed to update SMTP configuration" });
  }
});

// DELETE /api/admin/smtp/:id - Delete SMTP configuration
router.delete("/admin/smtp/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);

    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Don't allow deleting active config
    if (config.isActive) {
      res.status(400).json({ error: "Cannot delete the active SMTP configuration. Deactivate it first." });
      return;
    }

    await db.delete(smtpConfigTable).where(eq(smtpConfigTable.id, id));

    res.json({ success: true, message: "SMTP configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting SMTP config:", error);
    res.status(500).json({ error: "Failed to delete SMTP configuration" });
  }
});

// POST /api/admin/smtp/:id/activate - Activate specific SMTP configuration
router.post("/admin/smtp/:id/activate", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);

    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Deactivate all other configs
    await db.update(smtpConfigTable).set({ isActive: false }).where(eq(smtpConfigTable.isActive, true));

    // Activate this config
    const [activated] = await db.update(smtpConfigTable).set({ isActive: true }).where(eq(smtpConfigTable.id, id)).returning();

    const safeConfig = {
      ...activated,
      password: "***hidden***",
    };

    res.json({ config: safeConfig, message: "SMTP configuration activated successfully" });
  } catch (error) {
    console.error("Error activating SMTP config:", error);
    res.status(500).json({ error: "Failed to activate SMTP configuration" });
  }
});

// POST /api/admin/smtp/:id/verify - Verify SMTP connection
router.post("/admin/smtp/:id/verify", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);

    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Create a temporary transporter for verification
    const testTransporter = require("nodemailer").createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    const verified = await testTransporter.verify();

    if (verified) {
      res.json({ success: true, message: "SMTP connection verified successfully" });
    } else {
      res.status(400).json({ success: false, error: "SMTP connection verification failed" });
    }
  } catch (error) {
    console.error("Error verifying SMTP config:", error);
    res.status(500).json({ error: `Failed to verify SMTP configuration: ${(error as Error).message}` });
  }
});

// POST /api/admin/smtp/:id/test - Send test email
router.post("/admin/smtp/:id/test", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid SMTP configuration ID" });
      return;
    }

    const { testEmail } = req.body as { testEmail: string };

    if (!testEmail?.trim()) {
      res.status(400).json({ error: "Test email address is required" });
      return;
    }

    const [config] = await db.select().from(smtpConfigTable).where(eq(smtpConfigTable.id, id)).limit(1);

    if (!config) {
      res.status(404).json({ error: "SMTP configuration not found" });
      return;
    }

    // Send test email using the specific config
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    const mailOptions = {
      from: `${config.fromName || "Tree Tracking System"} <${config.fromEmail}>`,
      to: testEmail.trim(),
      subject: "SMTP Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3498db; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Test Email</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">SMTP Configuration is working successfully!</p>
            <p style="color: #666; font-size: 14px;">This is a test email to verify your SMTP configuration.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: `Failed to send test email: ${(error as Error).message}` });
  }
});

export default router;
