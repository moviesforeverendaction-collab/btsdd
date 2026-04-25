# 🤖 Aesthetic QR Code Telegram Bot

A Telegram bot that generates stylish QR codes using QRCode Monkey API.

---

## 📁 Project Structure

```
qr-bot/
├── bot.js                    ← Core bot logic (shared by all platforms)
├── server.js                 ← Express webhook server
├── polling.js                ← Long-polling entry point
├── package.json
├── .env.example              ← Copy to .env and fill in values
│
├── 🐳 Docker
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── ☁️ Netlify
│   ├── netlify.toml
│   └── netlify/functions/bot.js
│
├── 🚂 Railway
│   └── railway.toml
│
├── 🎨 Render
│   └── render.yaml
│
├── 💜 Heroku
│   ├── Procfile
│   └── app.json
│
└── 🖥️ VPS
    ├── ecosystem.config.js   ← PM2 config
    ├── nginx.conf            ← Nginx reverse proxy
    └── .github/workflows/deploy.yml  ← Auto-deploy CI/CD
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|---|---|---|
| `BOT_TOKEN` | Telegram bot token from @BotFather | `123456:ABC-DEF...` |
| `CHANNEL_ID` | Channel ID (negative number) | `-1003852109486` |
| `CHANNEL_LINK` | Channel link | `https://t.me/YourChannel` |
| `BOT_USERNAME` | Bot username (no @) | `QRcodeXroBot` |
| `WEBHOOK_DOMAIN` | Your app's public URL (webhook mode) | `https://app.railway.app` |
| `PORT` | Server port | `3000` |

---

## 🚀 Deployment Guides

---

### 1. 🐳 Docker (Self-hosted / Any VPS)

**Polling mode (easiest, no domain needed):**
```bash
# 1. Clone the repo
git clone https://github.com/your-username/qr-bot.git && cd qr-bot

# 2. Create your .env file
cp .env.example .env
nano .env   # Fill in your values

# 3. Run with polling
docker compose run --rm qr-bot node polling.js
```

**Webhook mode (with your own domain):**
```bash
# Edit docker-compose.yml:
#   command: node server.js
# Set WEBHOOK_DOMAIN in .env

docker compose up -d
docker compose logs -f     # View logs
docker compose down        # Stop
```

---

### 2. ☁️ Netlify (Free Serverless)

> Best for: Webhook-based, serverless, zero cost.

**Steps:**
1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from GitHub**
3. Build command: `npm install`
4. Publish directory: *(leave empty)*
5. Functions directory: `netlify/functions`
6. Go to **Site settings → Environment variables** and add all vars
7. After deploy, set the Telegram webhook:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://YOUR-SITE.netlify.app/.netlify/functions/bot"
```

---

### 3. 🚂 Railway (Recommended — Free tier available)

> Best for: Easy, persistent, auto-deploy.

**Steps:**
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repo
3. Go to **Variables** tab → add all env vars
4. Railway auto-assigns a domain → copy it (e.g. `https://qr-bot.up.railway.app`)
5. Set `WEBHOOK_DOMAIN` to that URL
6. Railway auto-deploys on every push ✅

**Or via CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set BOT_TOKEN=xxx CHANNEL_ID=xxx ...
```

---

### 4. 🎨 Render (Free tier available)

> Best for: Always-on free web service.

**Steps:**
1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Go to **Environment** → add all env vars
6. After deploy, copy the URL (e.g. `https://qr-bot.onrender.com`)
7. Set `WEBHOOK_DOMAIN` to that URL in env vars
8. Set the webhook:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://qr-bot.onrender.com/webhook/<SECRET>"
```

> ⚠️ Free tier sleeps after 15 min inactivity. Upgrade to Starter ($7/mo) for always-on.

---

### 5. 💜 Heroku

> Best for: Classic PaaS, easy CLI.

**Steps:**
```bash
# 1. Install Heroku CLI and login
heroku login

# 2. Create app
heroku create your-qr-bot

# 3. Set environment variables
heroku config:set BOT_TOKEN=xxx
heroku config:set CHANNEL_ID=-1003852109486
heroku config:set CHANNEL_LINK=https://t.me/YourChannel
heroku config:set BOT_USERNAME=YourBot
heroku config:set WEBHOOK_DOMAIN=https://your-qr-bot.herokuapp.com
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main

# 5. Scale
heroku ps:scale web=1

# 6. View logs
heroku logs --tail
```

---

### 6. 🖥️ VPS / Ubuntu Server (Most Control)

#### Option A: Long Polling with PM2 (Easiest)

```bash
# 1. SSH into your VPS
ssh user@your-server-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone your bot
git clone https://github.com/your-username/qr-bot.git
cd qr-bot
npm install --only=production

# 5. Configure
cp .env.example .env
nano .env   # Add your values

# 6. Start with PM2
pm2 start ecosystem.config.js --only qr-bot-polling
pm2 save
pm2 startup   # Auto-start on server reboot

# 7. Monitor
pm2 logs qr-bot-polling
pm2 status
```

#### Option B: Webhook with Nginx + SSL

```bash
# After Option A setup, also:

# 1. Install Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# 2. Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/qr-bot
sudo ln -s /etc/nginx/sites-available/qr-bot /etc/nginx/sites-enabled/
# Edit: replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/qr-bot

# 3. Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# 4. Start webhook server
pm2 start ecosystem.config.js --only qr-bot-webhook
pm2 save

# 5. Set Telegram webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://yourdomain.com/webhook/SECRET"
```

#### Auto-deploy with GitHub Actions

Add these secrets in your GitHub repo → Settings → Secrets:
- `VPS_HOST` — Your server IP
- `VPS_USER` — SSH username (e.g. `ubuntu`)
- `VPS_SSH_KEY` — Your private SSH key
- `VPS_PORT` — SSH port (default `22`)

Now every push to `main` auto-deploys! 🎉

---

## 🔧 Webhook Management

**Set webhook:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>"
```

**Check webhook status:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Delete webhook (switch to polling):**
```bash
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```

---

## 📊 Platform Comparison

| Platform | Cost | Mode | Difficulty | Sleep? |
|---|---|---|---|---|
| Docker + VPS | VPS cost | Both | Medium | ❌ Never |
| Railway | Free/$5+ | Webhook | Easy | ❌ Never |
| Render | Free/$7+ | Webhook | Easy | ✅ Free tier |
| Heroku | $5+ | Webhook | Easy | ❌ Never |
| Netlify | Free | Webhook | Medium | ❌ Never |
| PM2 on VPS | VPS cost | Both | Medium | ❌ Never |
