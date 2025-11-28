# Email Setup Guide

## 🔧 Configure Email for OTP Verification

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Create `.env` file in project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### 3. Alternative Email Providers

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

**Custom SMTP:**
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-password
```

### 4. Testing

Run the server and attempt login - check console for email status:
- ✅ Success: "OTP sent to user@email.com"
- ❌ Failure: "Email send failed: [error]"

### 5. Security Notes

- ⚠️ Never commit `.env` file to version control
- 🔒 Use App Passwords, not account passwords
- 📧 Use dedicated email account for system notifications
- 🔄 Rotate credentials regularly