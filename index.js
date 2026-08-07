const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot AFK dang cho lenh chat!'));
app.listen(3000, () => console.log('Web server ready!'));

const CONFIG = {
  host: 'tovamc.asia',
  port: 19033,
  username: 'VietNam_Gamer2026',
  password_game: 'chanbomayde123456',
  nick_chinh: '.minh9948' // Nick PE của bạn
};

let isFirstJoin = true;

function createBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: false
  });

  // Hàm vứt toàn bộ đồ trong túi ra đất
  function dropAllItems() {
    console.log('-> Dang vut toan bo do ra dat...');
    bot.inventory.items().forEach(item => {
      bot.tossStack(item);
    });
  }

  bot.on('spawn', () => {
    console.log('-> Bot da vao server tovamc.asia!');

    // 1. Dang ky / Dang nhap
    setTimeout(() => {
      if (isFirstJoin) {
        bot.chat(`/dk ${CONFIG.password_game} ${CONFIG.password_game}`);
        console.log('Da go /dk');
        isFirstJoin = false; 
      } else {
        bot.chat(`/dn ${CONFIG.password_game}`);
        console.log('Da go /dn');
      }
    }, 2000);

    // 2. Mo menu /afk
    setTimeout(() => {
      bot.chat('/afk');
      console.log('Da go /afk, cho mo ruong...');
    }, 5000);

    // Chong AFK: Nhay moi 30s
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 30000);
  });

  // Tu dong bam chon "AFK 1" khi ruong hien ra
  bot.on('windowOpen', async (window) => {
    console.log('-> Ruong Menu da mo! Chon AFK 1...');
    try {
      await bot.clickWindow(0, 0, 0); // Click slot 0 (AFK 1)
      console.log('-> Da qua khu AFK 1 thanh cong!');
    } catch (err) {
      console.log('Loi click ruong:', err);
    }
  });

  // XU LY LENH CHAT CHUNG TU NICK CHINH (.minh9948)
  bot.on('chat', (username, message) => {
    // Chi nhan lenh tu dung nick chinh
    if (username === CONFIG.nick_chinh) {
      
      // 1. Lenh vut do
      if (message === 'vutdo') {
        dropAllItems();
      } 
      
      // 2. Lenh TPA
      else if (message === 'tpa') {
        bot.chat(`/tpa ${CONFIG.nick_chinh}`);
        console.log(`-> Da gui /tpa cho ${CONFIG.nick_chinh}`);
      } 
      
      // 3. Lenh nhap code thu cong (Vi du ban chat: code denbu)
      else if (message.startsWith('code ')) {
        const codeInput = message.replace('code ', '').trim();
        bot.chat(`/code ${codeInput}`);
        console.log(`-> Da nhap code theo lenh chat: /code ${codeInput}`);
      }
    }
  });

  bot.on('end', () => {
    console.log('-> Vang ket noi/Server Reload! Vao lai sau 15s...');
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => console.log('Loi Bot:', err));
}

createBot();
        
