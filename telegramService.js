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

// 2. Kinga ya Constructor
let TelegramBot;
if (typeof TelegramBotInstance === 'function') {
  TelegramBot = TelegramBotInstance;
} else if (TelegramBotInstance.default && typeof TelegramBotInstance.default === 'function') {
  TelegramBot = TelegramBotInstance.default;
} else {
  TelegramBot = require('node-telegram-bot-api/src/telegram');
}

// 3. Washa Bot
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot ya 26-Tech imewaka vizuri na inasikiliza faili zako Telegram...");

// 📥 MTAMBO WA KUKUPA FILE ID
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.document) {
    const fileId = msg.document.file_id;
    return bot.sendMessage(chatId, `🚀 *Faili Limepokelewa!*\n\n📋 *TELEGRAM FILE ID YAKO:*\n\`${fileId}\`\n\n_Copy hiyo kodi hapo juu kisha ipache (paste) kwenye Admin Panel ya website yako._`, { parse_mode: 'Markdown' });
  }

  if (msg.audio) {
    const fileId = msg.audio.file_id;
    return bot.sendMessage(chatId, `🎵 *Mziki Umepokelewa!*\n\n📋 *TELEGRAM FILE ID YAKO:*\n\`${fileId}\`\n\n_Copy hiyo kodi hapo juu._`, { parse_mode: 'Markdown' });
  }

  if (msg.text && msg.text !== '/start') {
    return bot.sendMessage(chatId, "Mkuu, mimi sisomi meseji za kawaida. Nitumie faili la App (.apk, .zip, nk) ili nikupe File ID yake mara moja!");
  }
});

/**
 * Rudisha link ya zamani (compatibility tu)
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

/**
 * Pata file_path tu kutoka Telegram
 */
async function getTelegramFilePath(fileId) {
  try {
    const fileInfo = await bot.getFile(fileId);
    return fileInfo.file_path;
  } catch (error) {
    console.error("❌ Imefeli kuvuta file path kutoka Telegram:", error.message);
    throw error;
  }
}

/**
 * ✅ Stream file kutoka Telegram kwenda user kupitia server yako
 * Inafanya kazi nchi zote — hata zilizozuia Telegram!
 */
async function streamTelegramFile(fileId, res) {
  try {
    // Hatua 1: Pata file path
    const fileInfo = await bot.getFile(fileId);
    const filePath = fileInfo.file_path;
    const fileName = filePath.split('/').pop();

    // Hatua 2: Fetch file kutoka Telegram (Node.js v22 fetch built-in)
    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );

    if (!fileRes.ok) {
      throw new Error(`Telegram ilikataa ombi: ${fileRes.status}`);
    }

    // Hatua 3: Weka headers sahihi
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    const contentLength = fileRes.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Hatua 4: Stream file kwenda user
    const { Readable } = require('stream');
    Readable.fromWeb(fileRes.body).pipe(res);

  } catch (error) {
    console.error("❌ Stream imefeli:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Imeshindwa kupakua faili' });
    }
  }
}

module.exports = {
  getTelegramDownloadLink,
  getTelegramFilePath,
  streamTelegramFile
};