// 1. Vuta maktaba nzima ya Telegram
const TelegramBotInstance = require('node-telegram-bot-api');
const path = require('path');

// Kusoma .env
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Hitilafu Kuu: TELEGRAM_BOT_TOKEN haijapatikana kabisa kwenye .env!");
  process.exit(1); 
}

// 2. Kinga ya Constructor: Tambua kama maktaba imekuja kama export ya kawaida au default
let TelegramBot;
if (typeof TelegramBotInstance === 'function') {
  TelegramBot = TelegramBotInstance;
} else if (TelegramBotInstance.default && typeof TelegramBotInstance.default === 'function') {
  TelegramBot = TelegramBotInstance.default;
} else {
  // Njia ya mwisho kabisa (Fallback)
  TelegramBot = require('node-telegram-bot-api/src/telegram');
}

// 3. Washa Bot sasa kwa kutumia constructor iliyopatikana kwa usahihi
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot ya 26-Tech imewaka vizuri na inasikiliza faili zako Telegram...");

// 📥 MTAMBO WA KUKUPA FILE ID PAPO HAPO TELEGRAM
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Angalia kama mtumiaji ametuma faili (Document/APK/Zip)
  if (msg.document) {
    const fileId = msg.document.file_id;
    return bot.sendMessage(chatId, `🚀 *Faili Limepokelewa!*\n\n📋 *TELEGRAM FILE ID YAKO:*\n\`${fileId}\`\n\n_Copy hiyo kodi hapo juu kisha ipache (paste) kwenye Admin Panel ya website yako._`, { parse_mode: 'Markdown' });
  }

  // Angalia kama ametuma faili la mziki (Audio)
  if (msg.audio) {
    const fileId = msg.audio.file_id;
    return bot.sendMessage(chatId, `🎵 *Mziki Umepokelewa!*\n\n📋 *TELEGRAM FILE ID YAKO:*\n\`${fileId}\`\n\n_Copy hiyo kodi hapo juu._`, { parse_mode: 'Markdown' });
  }

  // Kama ametuma ujumbe wa kawaida wa maandishi
  if (msg.text && msg.text !== '/start') {
    return bot.sendMessage(chatId, "Mkuu, mimi sisomi meseji za kawaida. Nitumie faili la App (.apk, .zip, nk) ili nikupe File ID yake mara moja!");
  }
});

/**
 * Huduma ya kupata taarifa za faili kutoka Telegram kwa kutumia File ID
 */
async function getTelegramDownloadLink(fileId) {
  try {
    const fileInfo = await bot.getFile(fileId);
    const downloadLink = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
    return downloadLink;
  } catch (error) {
    console.error("❌ Imefeli kuvuta link kutoka Telegram:", error.message);
    throw error;
  }
}

module.exports = {
  getTelegramDownloadLink
};