// netlify/functions/bot.js
const bot = require("../../bot");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 200, body: "OK" };
    }
    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);
    return { statusCode: 200, body: "" };
  } catch (error) {
    console.error("Error in function:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
