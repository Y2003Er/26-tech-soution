const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// Kulazimisha Node.js isome .env iliyopo folda moja (root) na faili hili
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ Hitilafu Kuu: TELEGRAM_BOT_TOKEN haijapatikana kabisa kwenye .env!");
  console.error("Hakikisha faili lako la .env lina mstari kama: TELEGRAM_BOT_TOKEN=namba_za_token_yako");
  // Inazuia constructor isiwake kama hakuna token ili kuzuia "is not a constructor" crash
  process.exit(1); 
}

// Sasa itawaka salama 100% kwa sababu tumeshahakikisha token ipo
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