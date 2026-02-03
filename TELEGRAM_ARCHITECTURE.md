# 🤖 Telegram Notification System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────┐                              ┌──────────────┐    │
│  │  Browser  │◄────────────────────────────►│   Telegram   │    │
│  │  (React)  │                              │     App      │    │
│  └─────┬─────┘                              └──────┬───────┘    │
│        │                                            │             │
│        │ HTTP/REST                                  │ Webhook     │
│        │                                            │             │
└────────┼────────────────────────────────────────────┼────────────┘
         │                                            │
         │                                            │
┌────────▼────────────────────────────────────────────▼────────────┐
│                      BACKEND SERVER (Node.js)                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐         ┌──────────────────────────┐       │
│  │  Auth Routes    │         │   Telegram Routes        │       │
│  │  /api/auth/*    │         │   /api/telegram/*        │       │
│  └────────┬────────┘         └──────────┬───────────────┘       │
│           │                              │                        │
│           │                              │                        │
│  ┌────────▼────────────────────────────▼────────────────┐       │
│  │           Auth Controller                             │       │
│  │  - Login (with notification)                          │       │
│  │  - Change Password (with notification)                │       │
│  │                                                        │       │
│  │           Telegram Controller                         │       │
│  │  - handleWebhook                                      │       │
│  │  - linkTelegramAccount                                │       │
│  │  - unlinkTelegramAccount                              │       │
│  │  - getTelegramStatus                                  │       │
│  │  - testTelegramNotification                           │       │
│  └────────┬──────────────────────────────────────────────┘       │
│           │                                                       │
│           │                                                       │
│  ┌────────▼────────────────────────────────────────────┐         │
│  │         Transaction Controller                       │         │
│  │  - createTransaction (with notification)             │         │
│  └────────┬─────────────────────────────────────────────┘         │
│           │                                                       │
│           │                                                       │
│  ┌────────▼────────────────────────────────────────────┐         │
│  │              Services Layer                          │         │
│  │                                                      │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │     Telegram Service                 │          │         │
│  │  │  - sendTelegramMessage()             │          │         │
│  │  │  - formatNotificationMessage()       │          │         │
│  │  │  - setTelegramWebhook()              │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  │                                                      │         │
│  │  ┌──────────────────────────────────────┐          │         │
│  │  │     Cron Jobs Service                │          │         │
│  │  │  - Weekly summaries (Sundays 9 AM)   │          │         │
│  │  │  - Reminder checks (every 15 min)    │          │         │
│  │  └──────────────────────────────────────┘          │         │
│  └────────┬─────────────────────────────────────────────┘         │
│           │                                                       │
│           │                                                       │
│  ┌────────▼────────────────────────────────────────────┐         │
│  │              MongoDB Database                        │         │
│  │                                                      │         │
│  │  User Collection:                                    │         │
│  │  {                                                   │         │
│  │    name: String                                      │         │
│  │    email: String                                     │         │
│  │    telegramChatId: Number                            │         │
│  │    telegramEnabled: Boolean                          │         │
│  │    emailNotifications: Boolean                       │         │
│  │  }                                                   │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration Flow
```
User → Browser → POST /api/telegram/webhook
                    ↓
                Telegram Bot receives /start
                    ↓
                Sends Chat ID to user
                    ↓
User copies Chat ID
                    ↓
User → Browser → POST /api/telegram/link {chatId}
                    ↓
                Backend saves to DB
                    ↓
                Sends welcome message
```

### 2. Notification Flow
```
User Action (e.g., create transaction)
                    ↓
        Transaction Controller
                    ↓
        Get user from database
                    ↓
        Check if telegramEnabled === true
                    ↓
        Format notification message
                    ↓
        Send to Telegram API
                    ↓
        User receives notification
```

### 3. Webhook Flow
```
Telegram → POST /api/telegram/webhook
                    ↓
        Extract chat.id and message
                    ↓
        Process command (/start)
                    ↓
        Find or create user mapping
                    ↓
        Send response to user
                    ↓
        Return 200 OK to Telegram
```

## Notification Types

### 1. Transaction Notifications
**Trigger**: User creates a new transaction  
**Location**: `controllers/transactionController.js`  
**Format**:
```
💸 New Expense Added

Amount: ₹500
Category: Food
Description: Lunch
Date: 2/4/2026
```

### 2. Reminder Notifications
**Trigger**: Cron job (every 15 minutes)  
**Location**: `services/cronJobs.js`  
**Format**:
```
🔔 Reminder Alert

Pay electricity bill
Due today at 5:00 PM
⏰ 2 hours until event
```

### 3. Weekly Summary
**Trigger**: Cron job (Sundays at 9 AM)  
**Location**: `services/cronJobs.js`  
**Format**:
```
📊 Weekly Finance Summary

Income: ₹10,000
Expenses: ₹5,000
Balance: ₹5,000

Top spending: Food
```

### 4. Security Alerts
**Trigger**: Login, password change  
**Location**: `controllers/authController.js`  
**Format**:
```
🔐 Security Alert

New login to your Finance Tracker account
Time: 2/4/2026, 10:30 AM

If this wasn't you, please change your password immediately.
```

## API Endpoints

### Telegram Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/telegram/webhook` | No | Receive Telegram updates |
| POST | `/api/telegram/link` | Yes | Link Telegram account |
| POST | `/api/telegram/unlink` | Yes | Unlink Telegram account |
| GET | `/api/telegram/status` | Yes | Get connection status |
| POST | `/api/telegram/test` | Yes | Send test notification |

### Auth Endpoints (Updated)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login (sends notification) |
| PUT | `/api/auth/change-password` | Yes | Change password (sends notification) |

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  profilePhoto: String,
  
  // Email notifications
  emailNotifications: Boolean (default: true),
  reminderNotifications: Boolean (default: true),
  lastEmailSent: Date,
  
  // Telegram notifications
  telegramChatId: Number (default: null),
  telegramEnabled: Boolean (default: false),
  
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your_secret
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=App Name <your@email.com>

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_SECRET=random_secret_string (optional)
BASE_URL=http://localhost:5000 (or production URL)

# Frontend
CLIENT_URL=http://localhost:5173
```

## Security Considerations

### 1. Bot Token Protection
- ✅ Stored in `.env` file
- ✅ Never committed to git
- ✅ Not exposed to frontend
- ✅ Only accessible by backend

### 2. Chat ID Validation
- ✅ User manually enters chat ID
- ✅ Verified by sending test message
- ✅ One chat ID per user account
- ✅ Cannot link to multiple accounts

### 3. Webhook Security
- ✅ No authentication required (per Telegram spec)
- ✅ Validates webhook source
- ✅ Optional secret token for verification
- ✅ Rate limiting (if needed)

### 4. User Privacy
- ✅ Chat IDs stored securely in database
- ✅ Users can unlink anytime
- ✅ No messages stored
- ✅ Notifications only sent to owner

## Scalability

### Current Implementation
- ✅ **Per-user notifications**: Each user has their own chat ID
- ✅ **No bottlenecks**: Direct API calls to Telegram
- ✅ **Stateless**: No session management required
- ✅ **Database-driven**: All config stored in MongoDB
- ✅ **Horizontal scaling**: Can run multiple server instances

### Performance Considerations
- Telegram API rate limits: 30 messages/second per bot
- Webhook must respond within 60 seconds
- Cron jobs run on schedule (not resource-intensive)
- Database queries are indexed (user ID lookups)

## Error Handling

### 1. Failed Notifications
- Logged to console but doesn't crash app
- User experience not affected
- Can retry manually with "Send Test"

### 2. Invalid Chat IDs
- Validation at API level
- Error message returned to user
- Database remains consistent

### 3. Webhook Failures
- Returns 500 error to Telegram
- Telegram retries automatically
- Logged for debugging

## Testing Strategy

### Unit Tests
- Test notification formatting
- Test message sending logic
- Test webhook processing

### Integration Tests
- Test end-to-end linking flow
- Test notification triggers
- Test cron jobs

### Manual Testing
- Use `/test` endpoint
- Send `/start` to bot
- Create transactions and verify notifications

## Monitoring & Logging

### What to Monitor
- Webhook response times
- Notification success rates
- Telegram API errors
- User connection status
- Cron job execution

### Logging Points
- Webhook requests received
- Messages sent successfully
- Failed message attempts
- User linking/unlinking events
- Cron job executions

## Future Enhancements

### Potential Features
- 📊 Rich formatting with buttons
- 🔄 Two-way communication (reply to messages)
- 📈 Analytics dashboard
- 🌐 Multi-language support
- 🎨 Custom notification preferences
- 📱 Inline queries
- 🤖 AI-powered insights
- 🔔 Smart notification batching

### Infrastructure
- Redis for caching
- Message queue for reliability
- Webhook signature verification
- Rate limiting middleware
- Metrics dashboard

---

## Quick Reference

### Check Webhook Status
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

### Delete Webhook
```bash
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
```

### Set Webhook
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://yourapp.com/api/telegram/webhook"
```

### Send Test Message (Direct API)
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
  -d "chat_id=<CHAT_ID>" \
  -d "text=Test message"
```

---

**Documentation Version**: 1.0  
**Last Updated**: February 4, 2026  
**Maintainer**: Development Team
