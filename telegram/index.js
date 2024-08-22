const fs = require('fs');
const path = require('path');
const TelegramBot = require("node-telegram-bot-api");
const {TELEGRAM} = require("../config.json");
const bot = new TelegramBot(TELEGRAM["BOT_TOKEN"], { polling: true });
const options = {
  parse_mode: 'Markdown'
};

module.exports.TelegramLog = (type, msg) => {
  const chatID = TELEGRAM["LOG_CHANNELS"][type] || TELEGRAM["LOG_CHANNELS"]["GENEL"];
  const MAX_MESSAGE_LENGTH = 4096;
  const logFilePath = path.join(__dirname, 'gonderilemeyenloglar.txt');
  const writeErrorLog = (errorMessage) => {
    const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const logMessage = `-----------------------------------------------------------------------------------\n[${timestamp} [GMT+3]] Gönderilemeyen log mesajı:\n${errorMessage}\n-----------------------------------------------------------------------------------\n`;
    
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error('Log dosyasına yazılırken bir hata oluştu:', err);
    });
  };

  if (msg.length <= MAX_MESSAGE_LENGTH) {
    bot.sendMessage(chatID, msg, options).catch((error) => {
      writeErrorLog(msg);
    });
  } else {
    for (let i = 0; i < msg.length; i += MAX_MESSAGE_LENGTH) {
      const part = msg.substring(i, i + MAX_MESSAGE_LENGTH);
      bot.sendMessage(chatID, part, options).catch((error) => {
        writeErrorLog(part);
      });
    }
  }
};