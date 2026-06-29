const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Vuta token kutoka kwenye .env
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Hitilafu: TELEGRAM_BOT_TOKEN haijapatikana kwenye .env!");
}

// Washa bot bila kuwasha mfumo wa kusikiliza meseji (polling) kwa sababu tunaitumia tu kutuma
const bot = new TelegramBot(token, { polling: false });

/**
 * Huduma ya kupata taarifa za faili kutoka Telegram kwa kutumia File ID
 * @param {string} fileId - ID ya faili iliyopo Telegram
 * @returns {Promise<string>} - Link ya moja kwa moja ya kudownload faili
 */
async function getTelegramDownloadLink(fileId) {
  try {
    // 1. Omba Telegram itupe njia (file path) ya hili faili
    const fileInfo = await bot.getFile(fileId);
    
    // 2. Unganisha ile njia tuliyopewa na token yetu kutengeneza link rasmi
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