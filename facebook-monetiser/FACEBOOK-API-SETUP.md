# Facebook API Credentials - Sentimental Page

**Date Configured:** March 3, 2026
**Owner:** Bram (Office App)

---

## 📱 App Details

- **App Name:** Sentimental
- **App Type:** Business
- **Purpose:** Facebook Monetiser automation

---

## 🔐 Permissions

**Selected:** "Manage Everything on Your Page"

This includes:
- ✅ `pages_read_engagement` - Read page content and engagement metrics
- ✅ `pages_manage_posts` - Publish and manage posts
- ✅ `pages_manage_engagement` - Manage engagement data

---

## 📋 Credentials Checklist

### Needed for Fly.io Secrets:

- [ ] **FACEBOOK_APP_ID** - Copy from App Dashboard
- [ ] **FACEBOOK_APP_SECRET** - Click "Show" to reveal
- [ ] **FACEBOOK_PAGE_ID** - Get from Page → About → Page Info
- [ ] **FACEBOOK_PAGE_ACCESS_TOKEN** - Generate via Graph API Explorer

---

## 🛠️ How to Generate Page Access Token

1. Go to: https://developers.facebook.com/tools/explorer
2. Select **"Sentimental"** app
3. Click **"Get Token"** → **"Get Page Access Token"**
4. Select your page
5. Verify permissions are checked
6. Copy the token

---

## 🚀 Deployment Commands

Once credentials are obtained:

```bash
flyctl secrets set FACEBOOK_APP_ID=xxx -a facebook-monetiser
flyctl secrets set FACEBOOK_APP_SECRET=xxx -a facebook-monetiser
flyctl secrets set FACEBOOK_PAGE_ID=xxx -a facebook-monetiser
flyctl secrets set FACEBOOK_PAGE_ACCESS_TOKEN=xxx -a facebook-monetiser
```

---

## 📝 Notes

- **Token Expiry:** Page tokens expire after 60 days
- **Refresh:** Set reminder for May 2, 2026
- **Testing:** Use Settings → Test Connection in dashboard
- **Permissions:** All required permissions granted ✅

---

**Last Updated:** March 3, 2026
