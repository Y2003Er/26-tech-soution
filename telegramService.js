const TelegramBotInstance = require('node-telegram-bot-api');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN haijapatikana — sifa za icon/file za Telegram zitazimwa, lakini website itaendelea kufanya kazi.');
} else {
  let TelegramBot;
  if (typeof TelegramBotInstance === 'function') {
    TelegramBot = TelegramBotInstance;
  } else if (TelegramBotInstance.default && typeof TelegramBotInstance.default === 'function') {
    TelegramBot = TelegramBotInstance.default;
  } else {
    TelegramBot = require('node-telegram-bot-api/src/telegram');
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('Bot ya 26-Tech imewaka vizuri na inasikiliza faili zako Telegram...');

    bot.on('polling_error', (err) => {
      console.error('Telegram polling error:', err.message);
    });

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      if (msg.document) {
        const fileId = msg.document.file_id;
        return bot.sendMessage(chatId, `Faili limepokelewa.\n\nTELEGRAM FILE ID:\n\`${fileId}\`\n\nCopy hiyo kodi kisha ipache kwenye Admin Panel ya website yako.`, { parse_mode: 'Markdown' });
      }

      if (msg.audio) {
        const fileId = msg.audio.file_id;
        return bot.sendMessage(chatId, `Mziki umepokelewa.\n\nTELEGRAM FILE ID:\n\`${fileId}\`\n\nCopy hiyo kodi hapo juu.`, { parse_mode: 'Markdown' });
      }

      if (msg.photo) {
        const photoArray = msg.photo;
        const fileId = photoArray[photoArray.length - 1].file_id;
        return bot.sendMessage(chatId, `Picha imepokelewa (ICON).\n\nTELEGRAM FILE ID:\n\`${fileId}\`\n\nCopy hii kodi kisha ipache kwenye sehemu ya "APP ICON" kwenye Admin Panel.`, { parse_mode: 'Markdown' });
      }

      if (msg.text && msg.text !== '/start') {
        return bot.sendMessage(chatId, "Mkuu, mimi sisomi meseji za kawaida. Nitumie faili la App (.apk, .zip, n.k) au picha (icon) ili nikupe File ID yake mara moja!");
      }
    });
  } catch (err) {
    console.error('Imeshindwa kuanzisha Telegram bot:', err.message);
    bot = null;
  }
}

function ensureBot() {
  if (!bot) throw new Error('Telegram bot haijawekwa sawa (TELEGRAM_BOT_TOKEN haipo au si sahihi).');
}

async function getTelegramDownloadLink(fileId) {
  ensureBot();
  try {
    const fileInfo = await bot.getFile(fileId);
    return `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
  } catch (error) {
    console.error('Imefeli kuvuta link kutoka Telegram:', error.message);
    throw error;
  }
}

async function getTelegramFilePath(fileId) {
  ensureBot();
  try {
    const fileInfo = await bot.getFile(fileId);
    return fileInfo.file_path;
  } catch (error) {
    console.error('Imefeli kuvuta file path kutoka Telegram:', error.message);
    throw error;
  }
}

async function streamTelegramFile(fileId, res, fileName) {
  try {
    ensureBot();
    const fileInfo = await bot.getFile(fileId);
    const filePath = fileInfo.file_path;

    const extension = filePath.split('.').pop();
    const cleanName = fileName
      ? `${fileName.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim()}.${extension}`
      : filePath.split('/').pop();

    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );

    if (!fileRes.ok) {
      throw new Error(`Telegram ilikataa ombi: ${fileRes.status}`);
    }

    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
    res.setHeader('Content-Type', contentType);
    const contentLength = fileRes.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    const { Readable } = require('stream');
    Readable.fromWeb(fileRes.body).pipe(res);

  } catch (error) {
    console.error('Stream imefeli:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Imeshindwa kupakua faili' });
    }
  }
}

async function streamTelegramIcon(fileId, res) {
  try {
    ensureBot();
    const fileInfo = await bot.getFile(fileId);
    const filePath = fileInfo.file_path;

    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${token}/${filePath}`
    );

    if (!fileRes.ok) {
      throw new Error(`Telegram ilikataa ombi: ${fileRes.status}`);
    }

    const contentType = fileRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const { Readable } = require('stream');
    Readable.fromWeb(fileRes.body).pipe(res);

  } catch (error) {
    console.error('Icon stream imefeli:', error.message);
    if (!res.headersSent) {
      res.status(404).end();
    }
  }
}

module.exports = {
  getTelegramDownloadLink,
  getTelegramFilePath,
  streamTelegramFile,
  streamTelegramIcon
};