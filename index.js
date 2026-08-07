const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot AFK đang chờ lệnh chat!'));
app.listen(3000, () => console.log('Web server ready!'));

const CONFIG = {
  host: 'tovamc.asia',
  port: 25565,
  username: 'VietNam_Gamer2026',
  password_game: 'chanbomayde123456',
  nick_chinh: '.minh9948'
};

let isFirstJoin = true;

function createBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.21.11', // Ép về phiên bản phổ biến để tránh bị server kick
    checkTimeoutInterval: 60000
  });

  function dropAllItems() {
    console.log('-> Đang vứt toàn bộ đồ ra đất...');
    if (bot.inventory) {
      bot.inventory.items().forEach(item => {
        bot.tossStack(item);
      });
    }
  }

  bot.on('spawn', () => {
    console.log('-> Bot đã kết nối thành công vào server!');

    setTimeout(() => {
      if (isFirstJoin) {
        bot.chat(`/dk ${CONFIG.password_game} ${CONFIG.password_game}`);
        console.log('Đã gõ /dk');
        isFirstJoin = false; 
      } else {
        bot.chat(`/dn ${CONFIG.password_game}`);
        console.log('Đã gõ /dn');
      }
    }, 3000);

    setTimeout(() => {
      bot.chat('/afk');
      console.log('Đã gõ /afk');
    }, 7000);

    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  bot.on('windowOpen', async (window) => {
    try {
      await bot.clickWindow(0, 0, 0);
      console.log('-> Đã chọn AFK 1!');
    } catch (err) {
      console.log('Lỗi click menu:', err.message);
    }
  });

  bot.on('chat', (username, message) => {
    if (username === CONFIG.nick_chinh) {
      if (message === 'vutdo') {
        dropAllItems();
      } else if (message === 'tpa') {
        bot.chat(`/tpa ${CONFIG.nick_chinh}`);
        console.log(`-> Đã gửi /tpa cho ${CONFIG.nick_chinh}`);
      } else if (message.startsWith('code ')) {
        const codeInput = message.replace('code ', '').trim();
        bot.chat(`/code ${codeInput}`);
        console.log(`-> Đã nhập /code ${codeInput}`);
      }
    }
  });

  // Bắt lý do vì sao server kick bot
  bot.on('kicked', (reason) => {
    console.log('-> Bot bị Server Kick vì lý do:', reason);
  });

  bot.on('end', (reason) => {
    console.log(`-> Mất kết nối (${reason})! Kết nối lại sau 15s...`);
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => console.log('Lỗi Bot:', err.message));
}

createBot();
