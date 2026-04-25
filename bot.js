const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// ==================== CONFIGURATION ====================
const BOT_TOKEN = process.env.BOT_TOKEN || "BOT_TOKEN";
const CHANNEL_ID = process.env.CHANNEL_ID
  ? parseInt(process.env.CHANNEL_ID)
  : -1003852109486;
const CHANNEL_LINK = process.env.CHANNEL_LINK || "https://t.me/XylonBots";
const BOT_USERNAME = process.env.BOT_USERNAME || "QRcodeXroBot";

const STYLES = [
  { body: "diamond", eye: "frame12", eyeBall: "ball17" },
  { body: "rounded-pointed", eye: "frame14", eyeBall: "ball16" },
  { body: "edge-cut", eye: "frame6", eyeBall: "ball6" },
  { body: "circle-zebra-vertical", eye: "frame14", eyeBall: "ball18" },
  { body: "rounded-pointed", eye: "frame2", eyeBall: "ball2" },
  { body: "circle-zebra-vertical", eye: "frame14", eyeBall: "ball18" },
  { body: "edge-cut", eye: "frame6", eyeBall: "ball6" },
  { body: "rounded-pointed", eye: "frame14", eyeBall: "ball16" },
  { body: "diamond", eye: "frame12", eyeBall: "ball17" },
];

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const randomColor = () => {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

async function generateQRCode(data) {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const bodyColor = randomColor();
  const eyeColor = randomColor();

  const payload = {
    data,
    config: {
      body: style.body,
      eye: style.eye,
      eyeBall: style.eyeBall,
      bodyColor,
      bgColor: "#FFFFFF",
      eye1Color: eyeColor,
      eye2Color: eyeColor,
      eye3Color: eyeColor,
      eyeBall1Color: eyeColor,
      eyeBall2Color: eyeColor,
      eyeBall3Color: eyeColor,
      gradientColor1: randomColor(),
      gradientColor2: randomColor(),
      gradientType: Math.random() > 0.5 ? "linear" : "radial",
      gradientOnEyes: Math.random() > 0.5,
      logo: "",
      logoMode: "default",
    },
    size: 1000,
    download: "imageUrl",
    file: "png",
  };

  try {
    const response = await axios.post(
      "https://api.qrcode-monkey.com/qr/custom",
      payload
    );
    if (response.data && response.data.imageUrl) {
      return "http:" + response.data.imageUrl;
    }
  } catch (error) {
    console.error("QR API error:", error.message);
  }
  return null;
}

const bot = new Telegraf(BOT_TOKEN);

// Channel subscription middleware
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
    if (member.status === "kicked") {
      return ctx.reply(
        "<b>❌ You are banned from using this bot.</b>\nContact support if you think this is a mistake.",
        { parse_mode: "HTML" }
      );
    }
    return next();
  } catch (err) {
    if (err.description?.includes("Bad Request: user not found")) {
      return ctx.reply(
        "<b>🚀 Join our channel to use the bot!</b>\n\nClick below, join, then try again.",
        {
          parse_mode: "HTML",
          ...Markup.inlineKeyboard([
            Markup.button.url("📢 Join Channel", CHANNEL_LINK),
          ]),
        }
      );
    }
    console.error("Auth error:", err);
    return next();
  }
});

bot.start((ctx) => {
  const caption =
    "<b>✨ Welcome to Aesthetic QR Generator! ✨</b>\n\n" +
    "Send me any <b>text or URL</b> and I'll convert it into a <b>stylish QR code</b>.\n\n" +
    "🎨 Every QR is randomly styled – surprise every time!\n" +
    "🔥 Use <code>/r &lt;text&gt;</code> or just send text for premium designs.";
  ctx.replyWithPhoto("https://graph.org/file/e3b48386db3a7863db900.jpg", {
    caption,
    parse_mode: "HTML",
  });
});

bot.command(["r", "random"], async (ctx) => {
  const input = ctx.message.text.split(" ");
  if (input.length < 2) {
    return ctx.reply(
      "⚠️ Please include text after the command.\nExample: <code>/r Hello World</code>",
      { parse_mode: "HTML" }
    );
  }
  const text = input.slice(1).join(" ");
  const sentMsg = await ctx.reply(
    `⏳ Creating QR...\n✅ Your text: <code>${escapeHtml(text)}</code>`,
    { parse_mode: "HTML" }
  );

  const qrUrl = await generateQRCode(text);
  if (!qrUrl) {
    return ctx.telegram.editMessageText(
      ctx.chat.id,
      sentMsg.message_id,
      null,
      "❌ Failed to generate QR. Try again later.",
      { parse_mode: "HTML" }
    );
  }

  await ctx.deleteMessage(sentMsg.message_id);
  await ctx.replyWithPhoto(qrUrl, {
    caption: `<b>@${BOT_USERNAME}</b>\n\n<a href="https://t.me/share/url?url=${encodeURIComponent("Try this awesome QR bot! - @" + BOT_USERNAME)}">✨ Share Bot</a>`,
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.url(
        "🔗 Share Bot",
        `https://t.me/share/url?url=${encodeURIComponent("🤖 Aesthetic QR Bot - @" + BOT_USERNAME)}`
      ),
    ]),
  });
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const sentMsg = await ctx.reply(
    `⏳ Crafting your premium QR...\n✨ Text: <code>${escapeHtml(text)}</code>`,
    { parse_mode: "HTML" }
  );

  const qrUrl = await generateQRCode(text);
  if (!qrUrl) {
    return ctx.telegram.editMessageText(
      ctx.chat.id,
      sentMsg.message_id,
      null,
      "❌ QR generation failed. Please retry.",
      { parse_mode: "HTML" }
    );
  }

  await ctx.deleteMessage(sentMsg.message_id);
  await ctx.replyWithPhoto(qrUrl, {
    caption: `<b>@${BOT_USERNAME}</b>\n\n🌟 Premium style applied!\n<a href="https://t.me/share/url?url=${encodeURIComponent("Check out this QR bot! - @" + BOT_USERNAME)}">✨ Share Bot</a>`,
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.url(
        "🔗 Share Bot",
        `https://t.me/share/url?url=${encodeURIComponent("🤖 Aesthetic QR Bot - @" + BOT_USERNAME)}`
      ),
    ]),
  });
});

module.exports = bot;
