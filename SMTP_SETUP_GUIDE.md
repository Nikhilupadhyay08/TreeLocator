# SMTP Configuration System - Setup Guide

## Overview
This document explains the SMTP (Simple Mail Transfer Protocol) configuration system that has been integrated into the Tree Tracking System. This system allows administrators to manage email configurations for sending OTPs (One-Time Passwords) to users during login.

## Features

✨ **Key Features:**
- **Multiple SMTP Configurations**: Create and manage multiple SMTP server configurations
- **Easy Activation**: Switch between active SMTP configurations with a single click
- **Connection Verification**: Test SMTP connections before activation
- **Test Email Functionality**: Send test emails to verify configuration is working
- **Secure Credential Storage**: Passwords are encrypted in the database
- **OTP Email Delivery**: Automatically sends OTPs to user emails during login
- **Professional Email Templates**: Beautiful, responsive HTML email templates

## Database Schema

### SMTP Configuration Table (`smtp_config`)

```typescript
id: number                  // Primary key
name: string               // Configuration name (unique)
provider: string           // Email provider (gmail, outlook, custom)
host: string              // SMTP host address
port: integer             // SMTP port (587 for TLS, 465 for SSL)
secure: boolean           // TLS/SSL enabled
username: string          // Email/username for authentication
password: string          // Password (encrypted)
fromEmail: string         // Sender email address
fromName: string          // Sender display name
isActive: boolean         // Currently active configuration
testEmail: string         // Email for testing
createdAt: timestamp      // Creation timestamp
updatedAt: timestamp      // Last update timestamp
```

## API Endpoints

All SMTP endpoints are prefixed with `/api/admin/smtp`

### 1. **Get All SMTP Configurations**
```
GET /api/admin/smtp
```
Returns all SMTP configurations (passwords are hidden in response)

**Response:**
```json
{
  "configs": [
    {
      "id": 1,
      "name": "Gmail Config",
      "provider": "gmail",
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": true,
      "username": "your-email@gmail.com",
      "password": "***hidden***",
      "fromEmail": "your-email@gmail.com",
      "fromName": "Tree Tracking System",
      "isActive": true,
      "createdAt": "2026-04-07T10:00:00Z",
      "updatedAt": "2026-04-07T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 2. **Get Specific Configuration**
```
GET /api/admin/smtp/:id
```

### 3. **Create SMTP Configuration**
```
POST /api/admin/smtp
Content-Type: application/json

{
  "name": "Gmail Configuration",
  "provider": "gmail",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": true,
  "username": "your-email@gmail.com",
  "password": "your-app-password",
  "fromEmail": "your-email@gmail.com",
  "fromName": "Tree Tracking System"
}
```

### 4. **Update SMTP Configuration**
```
PUT /api/admin/smtp/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": true,
  "username": "email@gmail.com",
  "password": "new-password",
  "fromEmail": "email@gmail.com",
  "fromName": "Updated Name"
}
```

### 5. **Delete SMTP Configuration**
```
DELETE /api/admin/smtp/:id
```
⚠️ **Note:** Cannot delete an active configuration. Deactivate it first.

### 6. **Activate Configuration**
```
POST /api/admin/smtp/:id/activate
```
Activates the specified configuration and deactivates all others

### 7. **Verify Connection**
```
POST /api/admin/smtp/:id/verify
```
Verifies the SMTP connection without sending an email

**Response:**
```json
{
  "success": true,
  "message": "SMTP connection verified successfully"
}
```

### 8. **Send Test Email**
```
POST /api/admin/smtp/:id/test
Content-Type: application/json

{
  "testEmail": "admin@example.com"
}
```

## Setup Instructions

### For Gmail

1. **Create/Select Gmail Account**
   - Use an existing Gmail account or create a new one

2. **Enable 2-Factor Authentication** (Required for App Passwords)
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

3. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate and copy the password

4. **Create SMTP Configuration**
   - **Name:** Gmail Config
   - **Provider:** gmail
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Secure:** ✓ (TLS)
   - **Username:** your-email@gmail.com
   - **Password:** [Paste the 16-character App Password]
   - **From Email:** your-email@gmail.com
   - **From Name:** Tree Tracking System

5. **Test the Configuration**
   - Click "Verify Connection" to test
   - Click the mail icon to send a test email

### For Outlook/Office 365

1. **Use Your Office 365 Account**

2. **Create SMTP Configuration**
   - **Name:** Outlook Config
   - **Provider:** outlook
   - **Host:** smtp.office365.com
   - **Port:** 587
   - **Secure:** ✓ (TLS)
   - **Username:** your-email@outlook.com
   - **Password:** Your Outlook password
   - **From Email:** your-email@outlook.com
   - **From Name:** Tree Tracking System

3. **Verify and Test**
   - Click "Verify Connection"
   - Send a test email to ensure it works

### For Custom SMTP Server

1. **Obtain SMTP Details**
   - Contact your email hosting provider for SMTP settings
   - Get: Host, Port, Username, Password, SSL/TLS info

2. **Create SMTP Configuration**
   - **Name:** [Your Provider Name]
   - **Provider:** custom
   - **Host:** [Your SMTP Host]
   - **Port:** [Your SMTP Port]
   - **Secure:** [Based on provider - usually true for 465 or 587]
   - **Username:** [Your email/username]
   - **Password:** [Your password]
   - **From Email:** [Your email address]
   - **From Name:** Tree Tracking System

3. **Test the Configuration**
   - Verify the connection
   - Send a test email

## Usage

### How OTPs Are Sent

When a Forest Officer signs up:

1. Officer creates account with email and password
2. System generates a 6-digit OTP
3. **Email is automatically sent** using the configured SMTP server
4. Officer receives OTP in their inbox
5. Officer enters OTP to verify account

### In Admin Panel

1. **Go to Admin Panel** → Click **SMTP** tab
2. **To Create:** Click "Add SMTP Configuration"
3. **To Activate:** Click the checkmark icon on the configuration
4. **To Test:** Click the mail icon and enter a test email address
5. **To Verify Connection:** Click the circle icon
6. **To Edit:** Click the edit icon
7. **To Delete:** Click the trash icon (only for inactive configs)

## Security Best Practices

⚠️ **Important Security Guidelines:**

1. **Use App-Specific Passwords**
   - For Gmail: Use 16-character app passwords, not your regular password
   - For Office 365: Consider using app passwords if available

2. **Enable 2-Factor Authentication**
   - Always enable 2FA on your email account
   - Protects against unauthorized access

3. **Monitor Active Configuration**
   - Only one configuration should be active at a time
   - Immediately change active configuration if compromised

4. **Store Credentials Securely**
   - Never share credential passwords
   - In production, use environment variables or secrets manager
   - The system stores passwords encrypted in the database

5. **Test Before Production**
   - Always verify connection and send test emails
   - Ensure OTPs are being delivered correctly

6. **Rotate Credentials Regularly**
   - Change passwords periodically
   - Update SMTP credentials when needed

## Troubleshooting

### "SMTP connection verification failed"

**Solutions:**
- Verify host and port are correct
- Check if 2FA is enabled (Gmail requires App Password)
- Ensure "Less secure app access" is disabled (Gmail)
- Verify username and password are correct
- Check firewall/network isn't blocking SMTP port

### "Test email not received"

**Solutions:**
- Check spam/junk folder
- Verify email address is correct
- Ensure SMTP connection is verified first
- Check if "from" email is properly configured
- Review server logs for errors

### "Cannot activate configuration"

**Solutions:**
- Make sure the current active config is tested and working
- Cannot have two active configs at once (one will be deactivated automatically)
- Ensure all required fields are filled

### "Account already verified error"

**Solutions:**
- This is normal for already-verified accounts
- Verification only happens on first signup

## Environment Variables (Optional)

For enhanced security in production, consider using environment variables:

```bash
# In your .env file
SMTP_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Tree Tracking System
```

Then load these into the database during initialization.

## Testing

### Manual Testing

1. Create a test SMTP configuration
2. Click "Verify Connection" button
3. Click the mail icon and enter your email
4. Check your inbox for test email
5. Verify the connection works

### Integration Testing

1. Create a new Forest Officer account
2. Check that OTP email is received
3. Verify OTP matches in email and system
4. Complete verification process
5. Confirm login with verified account

## Next Steps

1. **Set up Gmail or Outlook account** with app password
2. **Access Admin Panel** → SMTP tab
3. **Create SMTP Configuration** with your email details
4. **Verify Connection** to ensure it works
5. **Send Test Email** to confirm delivery
6. **Activate Configuration** for production use
7. **Test the OTP system** by creating a test officer account

## Support

For issues with:
- **Gmail setup:** [Google Account Help](https://support.google.com/mail)
- **Outlook setup:** [Microsoft Support](https://support.microsoft.com/en-us/outlook)
- **System issues:** Check backend logs for error messages

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│     Officer Signs Up / Requests OTP     │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Generate 6-digit  │
        │       OTP          │
        └────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  Load Active SMTP Config       │
    │  from Database                 │
    └────────────────┬───────────────┘
                     │
                     ▼
      ┌──────────────────────────┐
      │  Create Nodemailer       │
      │  Transport with SMTP     │
      │  Credentials             │
      └──────────┬───────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │  Format OTP Email with     │
    │  HTML Template             │
    └──────────┬──────────────────┘
               │
               ▼
  ┌────────────────────────────────┐
  │  Send Email via SMTP Server    │
  └──────────┬─────────────────────┘
             │
             ▼
  ┌────────────────────────────────┐
  │  OTP Delivered to User Email   │
  │  User Receives OTP             │
  └────────────────────────────────┘
```

## File Structure

```
backend/
├── src/
│   ├── db/
│   │   └── schema/
│   │       └── smtp_config.ts        # SMTP schema
│   ├── lib/
│   │   └── email.ts                   # Email service with nodemailer
│   └── routes/
│       └── smtp.ts                    # SMTP API endpoints
│
frontend/
└── src/
    └── components/
        └── smtp-management.tsx        # SMTP admin UI
```

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Production Ready
