// polling.js — Long polling mode (VPS, local, any server without webhook)
const bot = require("./bot");

console.log("🚀 Starting bot in long polling mode...");

bot.launch()
  .then(() => console.log("✅ Bot is running!"))
  .catch((err) => {
    console.error("❌ Failed to start bot:", err.message);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
