# SMTP System - Quick Start Guide

## What is This?

A system to send OTP (One-Time Password) emails to users when they register. Admins can manage which email account to use through a simple dashboard.

## Quick Setup (5 minutes)

### Step 1: Get Gmail Ready ⏱️ 2 min

1. Go to [Google Account](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not done)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select Mail + Windows Computer (or your device)
5. Copy the 16-character password

### Step 2: Add to System ⏱️ 1 min

1. Open Tree Tracking System in browser
2. Go to **Admin Panel** (top navigation)
3. Click **SMTP** tab
4. Click **"Add SMTP Configuration"**

### Step 3: Fill in Details ⏱️ 1 min

| Field | Value |
|-------|-------|
| **Name** | Gmail Config |
| **Provider** | gmail |
| **Host** | smtp.gmail.com |
| **Port** | 587 |
| **Secure (TLS)** | ✓ Check |
| **Username** | your-email@gmail.com |
| **Password** | [Paste 16-char password] |
| **From Email** | your-email@gmail.com |
| **From Name** | Tree Tracking System |

Click **Create Configuration**

### Step 4: Verify & Test ⏱️ 1 min

1. Find your new configuration in the table
2. Click the **✓ circle icon** to verify connection
3. Click the **mail icon** to send test email
4. Check your inbox for test email
5. Click the **checkmark** to activate

**Done! 🎉**

Now whenever someone registers, they'll get an OTP email automatically!

---

## For Each Email Provider

### Gmail (Recommended)

**Host:** smtp.gmail.com  
**Port:** 587  
**Secure:** ✓ Yes (TLS)

⚠️ **Important:** Use an [App Password](https://myaccount.google.com/apppasswords), NOT your regular Gmail password!

### Outlook

**Host:** smtp.office365.com  
**Port:** 587  
**Secure:** ✓ Yes (TLS)

Use your regular Outlook password.

### Custom SMTP

Ask your email provider for:
- SMTP Host
- SMTP Port (usually 587 or 465)
- Username
- Password
- Whether to use TLS/SSL

---

## Testing It Works

1. **Admin Panel** → **Users** tab
2. Create a new Forest Officer account
3. Check the email address receives OTP
4. Complete the signup with OTP
5. ✅ Success!

---

## Troubleshooting in 10 Seconds

| Problem | Fix |
|---------|-----|
| "Connection failed" | Check Gmail/Outlook password is correct |
| "Test email not received" | Check spam folder, wait 1 minute |
| "No SMTP config" | Create one in SMTP tab first |
| "Cannot delete active" | Deactivate first (click checkmark) |

---

## Security Notes

✅ **Good:**
- Passwords are hidden in the UI
- Only admins can manage SMTP settings
- OTPs only sent via email (not displayed)
- Can switch email accounts anytime

⚠️ **Remember:**
- Use App Passwords for Gmail (safer)
- Enable 2FA on your email account
- Don't share passwords
- Change password if compromised

---

## What Happens Behind the Scenes

```
Officer Signs Up
        ↓
System Generates OTP (6 digits)
        ↓
Loads Email Config from Database
        ↓
Sends Email via Nodemailer + SMTP
        ↓
Officer Receives Beautiful OTP Email
        ↓
Officer Enters OTP in App
        ↓
Account Verified ✅
```

---

## Files to Know

- **SMTP_SETUP_GUIDE.md** - Detailed setup (100+ lines)
- **SMTP_IMPLEMENTATION_SUMMARY.md** - What was built
- **Admin Panel** → **SMTP tab** - Where you manage configs

---

## Command Line (Optional)

Push database changes:
```bash
cd backend
pnpm run db:push
```

Start backend:
```bash
pnpm run dev
```

---

## FAQ

**Q: Can I use multiple email accounts?**  
A: Yes! Create multiple configurations. Only one is active at a time.

**Q: What if emails aren't received?**  
A: Check spam folder, verify connection, send test email first.

**Q: Do users see the password?**  
A: No. It's hidden in UI and API responses.

**Q: Can I delete a configuration?**  
A: Yes, but only if it's not active. Deactivate first.

**Q: How long are OTPs valid?**  
A: 10 minutes (configurable in code if needed).

---

## You're All Set! 🚀

For issues, detailed setup, or advanced options, see **SMTP_SETUP_GUIDE.md**.

Any questions? The system logs errors - check backend console output!
