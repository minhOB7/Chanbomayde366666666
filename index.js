const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot AFK dang hoat dong!'));
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
    version: '1.20.4',
    checkTimeoutInterval: 60000
  });

  function dropAllItems() {
    console.log('-> Dang vut toan bo do ra dat...');
    if (bot.inventory) {
      bot.inventory.items().forEach(item => {
        bot.tossStack(item);
      });
    }
  }

  bot.on('spawn', () => {
    console.log('-> BOT DA VAO SERVER THANH CONG!');

    setTimeout(() => {
      if (isFirstJoin) {
        bot.chat(`/dk ${CONFIG.password_game} ${CONFIG.password_game}`);
        console.log('Da go /dk');
        isFirstJoin = false; 
      } else {
        bot.chat(`/dn ${CONFIG.password_game}`);
        console.log('Da go /dn');
      }
    }, 3000);

    setTimeout(() => {
      bot.chat('/afk');
      console.log('Da go /afk');
    }, 7000);

    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  bot.on('windowOpen', async (window) => {
    try {
      await bot.clickWindow(0, 0, 0);
      console.log('-> Da chon AFK 1!');
    } catch (err) {
      console.log('Loi click menu:', err.message);
    }
  });

  bot.on('chat', (username, message) => {
    if (username === CONFIG.nick_chinh) {
      if (message === 'vutdo') {
        dropAllItems();
      } else if (message === 'tpa') {
        bot.chat(`/tpa ${CONFIG.nick_chinh}`);
        console.log(`-> Da gui /tpa cho ${CONFIG.nick_chinh}`);
      } else if (message.startsWith('code ')) {
        const codeInput = message.replace('code ', '').trim();
        bot.chat(`/code ${codeInput}`);
        console.log(`-> Da nhap /code ${codeInput}`);
      }
    }
  });

  bot.on('kicked', (reason) => console.log('-> Server kick bot:', reason));
  bot.on('end', (reason) => {
    console.log(`-> Mat ket noi (${reason})! Vao lai sau 15s...`);
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => console.log('Loi Bot:', err.message));
}

createBot();

