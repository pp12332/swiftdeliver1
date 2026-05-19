# SwiftDeliver Backend — Deployment Guide

## What you need (all free)
1. GitHub account → github.com
2. MongoDB Atlas account → mongodb.com/atlas
3. Railway account → railway.app

---

## Step 1 — Set up MongoDB (your database)

1. Go to **mongodb.com/atlas** and create a free account
2. Click **"Build a Database"** → choose **Free (M0)** → click Create
3. Create a username and password (save these!)
4. Under "Network Access" → Add IP Address → click **"Allow Access from Anywhere"**
5. Go to your cluster → click **"Connect"** → **"Connect your application"**
6. Copy the connection string — it looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
7. Replace `<password>` with your actual password and add `swiftdeliver` at the end:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/swiftdeliver`

---

## Step 2 — Set up Gmail for sending OTP emails

1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Then go to Security → **App Passwords**
3. Create a new App Password for "Mail"
4. Copy the 16-character password it gives you

---

## Step 3 — Deploy to Railway

1. Go to **railway.app** and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Upload your backend folder to a new GitHub repo first, OR use **"Empty Project"** then:
   - Click **"Add a Service"** → **"GitHub Repo"**

### Alternative (easiest): Deploy via Railway CLI
1. Install Railway CLI: `npm install -g @railway/cli`
2. Open terminal in the `swiftdeliver-backend` folder
3. Run: `railway login`
4. Run: `railway init`
5. Run: `railway up`

### Set Environment Variables in Railway:
After deploying, go to your Railway project → Variables tab → add these:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/swiftdeliver
JWT_SECRET=SwiftDeliver2024SuperSecretKey!ChangeMe
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
PORT=3000
FRONTEND_URL=*
```

6. Railway will give you a URL like: `https://swiftdeliver-backend-production.up.railway.app`

---

## Step 4 — Update your frontend

Open your `index.html` file and find this line near the top:
```
const API = 'https://YOUR-RAILWAY-URL.up.railway.app/api';
```
Replace with your actual Railway URL.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/resend-otp | Resend OTP code |
| POST | /api/auth/login | Log in |
| POST | /api/auth/forgot-password | Send reset code |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/me | Get profile (needs token) |
| PUT | /api/auth/me | Update profile (needs token) |
| POST | /api/auth/change-password | Change password (needs token) |

---

## Test the API is working

Visit your Railway URL in a browser:
`https://your-url.up.railway.app/`

You should see:
```json
{ "status": "SwiftDeliver API is running!", "version": "1.0.0" }
```
