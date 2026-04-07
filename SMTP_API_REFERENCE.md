# SMTP API - Developer Reference

## Base URL
```
/api/admin/smtp
```

## Authentication
All requests require Bearer token in Authorization header:
```
Authorization: Bearer YOUR_TOKEN
```

---

## 1. List All Configurations

### Request
```http
GET /api/admin/smtp
Authorization: Bearer TOKEN
```

### Response (200)
```json
{
  "configs": [
    {
      "id": 1,
      "name": "Gmail Production",
      "provider": "gmail",
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": true,
      "username": "notifications@example.com",
      "password": "***hidden***",
      "fromEmail": "notifications@example.com",
      "fromName": "Tree Tracking System",
      "isActive": true,
      "createdAt": "2026-04-07T10:00:00Z",
      "updatedAt": "2026-04-07T10:00:00Z"
    }
  ],
  "total": 1
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/admin/smtp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Get Single Configuration

### Request
```http
GET /api/admin/smtp/:id
Authorization: Bearer TOKEN
```

### Response (200)
```json
{
  "config": {
    "id": 1,
    "name": "Gmail Production",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "notifications@example.com",
    "password": "***hidden***",
    "fromEmail": "notifications@example.com",
    "fromName": "Tree Tracking System",
    "isActive": true,
    "createdAt": "2026-04-07T10:00:00Z",
    "updatedAt": "2026-04-07T10:00:00Z"
  }
}
```

### Error Response (404)
```json
{
  "error": "SMTP configuration not found"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/admin/smtp/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Create Configuration

### Request
```http
POST /api/admin/smtp
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Gmail Production",
  "provider": "gmail",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": true,
  "username": "notifications@example.com",
  "password": "your-app-password-here",
  "fromEmail": "notifications@example.com",
  "fromName": "Tree Tracking System"
}
```

### Response (201)
```json
{
  "config": {
    "id": 1,
    "name": "Gmail Production",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "notifications@example.com",
    "password": "***hidden***",
    "fromEmail": "notifications@example.com",
    "fromName": "Tree Tracking System",
    "isActive": false,
    "createdAt": "2026-04-07T10:00:00Z",
    "updatedAt": "2026-04-07T10:00:00Z"
  }
}
```

### Error Response (409)
```json
{
  "error": "An SMTP configuration with this name already exists."
}
```

### Error Response (400)
```json
{
  "error": "Missing required fields: name, provider, host, port, username, password, fromEmail"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/admin/smtp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gmail Production",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "notifications@example.com",
    "password": "your-app-password",
    "fromEmail": "notifications@example.com",
    "fromName": "Tree Tracking System"
  }'
```

---

## 4. Update Configuration

### Request
```http
PUT /api/admin/smtp/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Gmail Updated",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": true,
  "username": "new-email@example.com",
  "password": "new-password",
  "fromEmail": "new-email@example.com",
  "fromName": "Updated Name"
}
```

### Response (200)
```json
{
  "config": {
    "id": 1,
    "name": "Gmail Updated",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "new-email@example.com",
    "password": "***hidden***",
    "fromEmail": "new-email@example.com",
    "fromName": "Updated Name",
    "isActive": false,
    "createdAt": "2026-04-07T10:00:00Z",
    "updatedAt": "2026-04-07T12:00:00Z"
  }
}
```

### cURL Example
```bash
curl -X PUT http://localhost:3000/api/admin/smtp/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gmail Updated",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "new-email@example.com",
    "password": "new-password",
    "fromEmail": "new-email@example.com",
    "fromName": "Updated Name"
  }'
```

---

## 5. Delete Configuration

### Request
```http
DELETE /api/admin/smtp/:id
Authorization: Bearer TOKEN
```

### Response (200)
```json
{
  "success": true,
  "message": "SMTP configuration deleted successfully"
}
```

### Error Response (400)
```json
{
  "error": "Cannot delete the active SMTP configuration. Deactivate it first."
}
```

### Error Response (404)
```json
{
  "error": "SMTP configuration not found"
}
```

### cURL Example
```bash
curl -X DELETE http://localhost:3000/api/admin/smtp/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Activate Configuration

### Request
```http
POST /api/admin/smtp/:id/activate
Authorization: Bearer TOKEN
```

### Response (200)
```json
{
  "config": {
    "id": 1,
    "name": "Gmail Production",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "notifications@example.com",
    "password": "***hidden***",
    "fromEmail": "notifications@example.com",
    "fromName": "Tree Tracking System",
    "isActive": true,
    "createdAt": "2026-04-07T10:00:00Z",
    "updatedAt": "2026-04-07T12:00:00Z"
  },
  "message": "SMTP configuration activated successfully"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/admin/smtp/1/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Verify Connection

### Request
```http
POST /api/admin/smtp/:id/verify
Authorization: Bearer TOKEN
```

### Response (200)
```json
{
  "success": true,
  "message": "SMTP connection verified successfully"
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": "SMTP connection verification failed"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/admin/smtp/1/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. Send Test Email

### Request
```http
POST /api/admin/smtp/:id/test
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "testEmail": "admin@example.com"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

### Error Response (400)
```json
{
  "error": "Test email address is required"
}
```

### Error Response (500)
```json
{
  "error": "Failed to send test email: Authentication failed"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/admin/smtp/1/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testEmail": "admin@example.com"
  }'
```

---

## Common Use Cases

### Scenario 1: Setup New SMTP Configuration

```bash
# 1. Create configuration
curl -X POST http://localhost:3000/api/admin/smtp \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gmail Config",
    "provider": "gmail",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "username": "noreply@example.com",
    "password": "app-password",
    "fromEmail": "noreply@example.com",
    "fromName": "Tree Tracking"
  }'

# 2. Verify connection
curl -X POST http://localhost:3000/api/admin/smtp/1/verify \
  -H "Authorization: Bearer TOKEN"

# 3. Send test email
curl -X POST http://localhost:3000/api/admin/smtp/1/test \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "admin@example.com"}'

# 4. Activate
curl -X POST http://localhost:3000/api/admin/smtp/1/activate \
  -H "Authorization: Bearer TOKEN"
```

### Scenario 2: Switch Email Providers

```bash
# 1. Create new configuration (Outlook instead of Gmail)
curl -X POST http://localhost:3000/api/admin/smtp \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Outlook Config",
    "provider": "outlook",
    "host": "smtp.office365.com",
    "port": 587,
    "secure": true,
    "username": "noreply@company.com",
    "password": "outlook-password",
    "fromEmail": "noreply@company.com",
    "fromName": "Tree Tracking"
  }'

# 2. Test new configuration
curl -X POST http://localhost:3000/api/admin/smtp/2/test \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "admin@example.com"}'

# 3. Activate (automatically deactivates Gmail)
curl -X POST http://localhost:3000/api/admin/smtp/2/activate \
  -H "Authorization: Bearer TOKEN"

# 4. Delete old configuration
curl -X DELETE http://localhost:3000/api/admin/smtp/1 \
  -H "Authorization: Bearer TOKEN"
```

### Scenario 3: Emergency Switch

```bash
# List all configs to find alternate
curl -X GET http://localhost:3000/api/admin/smtp \
  -H "Authorization: Bearer TOKEN"

# Activate backup config
curl -X POST http://localhost:3000/api/admin/smtp/2/activate \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | ✓ Request worked |
| 201 | Created | ✓ Configuration created |
| 400 | Bad Request | Check required fields |
| 404 | Not Found | Check configuration ID |
| 409 | Conflict | Name already exists or other conflict |
| 500 | Server Error | Check logs, try again |

---

## Rate Limiting

None currently implemented. Add in production if needed.

---

## Response Format

All responses are JSON:

**Success:**
```json
{
  "field": "value",
  "nested": {
    "data": "here"
  }
}
```

**Error:**
```json
{
  "error": "Description of what went wrong"
}
```

---

## Testing with Postman

1. Import endpoints as new requests
2. Set Authorization type: Bearer Token
3. Paste your token
4. Use request bodies from above examples
5. Send requests

---

## Key Points

✅ **Remember:**
- Passwords are hidden in responses
- Only one configuration can be active
- Activate automatically deactivates others
- Verify before activate
- Test before using in production
- All endpoints require authentication

---

## Performance

- GET endpoints: ~100ms
- POST endpoints: ~500ms (SMTP dependent)
- Verify: ~2000ms (server dependent)
- Test email: ~5000ms (network dependent)

---

## Integration Example

```javascript
// Get all SMTP configs
const response = await fetch('/api/admin/smtp', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

// Create new config
const newConfig = await fetch('/api/admin/smtp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Gmail',
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    username: 'email@gmail.com',
    password: 'app-password',
    fromEmail: 'email@gmail.com',
    fromName: 'System'
  })
});
```

---

## Support

For issues:
1. Check backend logs
2. Verify configuration details
3. Test SMTP connection manually
4. See SMTP_SETUP_GUIDE.md for detailed troubleshooting
