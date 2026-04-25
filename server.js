// server.js — Webhook mode (Railway, Render, Heroku, VPS)
const express = require("express");
const bot = require("./bot");

const PORT = process.env.PORT || 3000;
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN; // e.g. https://your-app.railway.app
const SECRET_PATH = process.env.SECRET_PATH || bot.secretPathComponent();

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("✅ QR Bot is running!"));
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

async function startBot() {
  if (!WEBHOOK_DOMAIN) {
    console.error("❌ WEBHOOK_DOMAIN env var is missing.");
    console.log("💡 Falling back to long polling...");
    await bot.launch();
    console.log("✅ Bot started in polling mode.");
    return;
  }

  const webhookUrl = `${WEBHOOK_DOMAIN}/webhook/${SECRET_PATH}`;

  // Register webhook handler
  app.use(await bot.createWebhook({ domain: WEBHOOK_DOMAIN, path: `/webhook/${SECRET_PATH}` }));

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Webhook: ${webhookUrl}`);
  });
}

startBot().catch(console.error);

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
