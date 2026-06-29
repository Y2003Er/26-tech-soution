const TelegramBotInstance = require('node-telegram-bot-api');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Hitilafu Kuu: TELEGRAM_BOT_TOKEN haijapatikana kabisa kwenye .env!");
  process.exit(1); 
}

let TelegramBot;
if (typeof TelegramBotInstance === 'function') {
  TelegramBot = TelegramBotInstance;
} else if (TelegramBotInstance.default && typeof TelegramBotInstance.default === 'function') {
  TelegramBot = TelegramBotInstance.default;
} else {
  TelegramBot = require('node-telegram-bot-api/src/telegram');
}

const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot ya 26-Tech imewaka vizuri na inasikiliza faili zako Telegram...");

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

async function getTelegramDownloadLink(fileId) {
  try {
    const fileInfo = await bot.getFile(fileId);
    return `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
  } catch (error) {
    console.error("❌ Imefeli kuvuta link kutoka Telegram:", error.message);
    throw error;
  }
}

async function getTelegramFilePath(fileId) {
  try {
    const fileInfo = await bot.getFile(fileId);
    return fileInfo.file_path;
  } catch (error) {
    console.error("❌ Imefeli kuvuta file path kutoka Telegram:", error.message);
    throw error;
  }
}

async function streamTelegramFile(fileId, res, fileName) {
  try {
    // Hatua 1: Pata file path
    const fileInfo = await bot.getFile(fileId);
    const filePath = fileInfo.file_path;

    // Hatua 2: Tengeneza jina zuri la file
    const extension = filePath.split('.').pop();
    const cleanName = fileName
      ? `${fileName.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim()}.${extension}`
      : filePath.split('/').pop();

    // Hatua 3: Fetch file kutoka Telegram
    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );

    if (!fileRes.ok) {
      throw new Error(`Telegram ilikataa ombi: ${fileRes.status}`);
    }

    // Hatua 4: Weka headers
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
    res.setHeader('Content-Type', contentType);
    const contentLength = fileRes.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Hatua 5: Stream kwenda user
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