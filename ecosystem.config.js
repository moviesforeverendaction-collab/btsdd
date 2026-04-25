// ecosystem.config.js — PM2 config for VPS deployment
module.exports = {
  apps: [
    {
      // ── POLLING MODE (recommended for VPS — no nginx/domain needed) ──
      name: "qr-bot-polling",
      script: "polling.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        BOT_TOKEN: "your_token_here",       // Or use .env file
        CHANNEL_ID: "-1003852109486",
        CHANNEL_LINK: "https://t.me/XylonBots",
        BOT_USERNAME: "QRcodeXroBot",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },

    {
      // ── WEBHOOK MODE (needs nginx + domain + SSL) ──
      name: "qr-bot-webhook",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        BOT_TOKEN: "your_token_here",
        CHANNEL_ID: "-1003852109486",
        CHANNEL_LINK: "https://t.me/XylonBots",
        BOT_USERNAME: "QRcodeXroBot",
        WEBHOOK_DOMAIN: "https://yourdomain.com",
      },
      error_file: "./logs/webhook-err.log",
      out_file: "./logs/webhook-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
