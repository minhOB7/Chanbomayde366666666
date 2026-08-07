const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
// Thay đoạn app.get('/') ở đầu code thành:
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot Control</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 20px; background: #121212; color: white; }
          button { padding: 15px 25px; margin: 10px; font-size: 18px; border: none; border-radius: 8px; cursor: pointer; }
          .tpa { background: #4CAF50; color: white; }
          .vut { background: #f44336; color: white; }
        </style>
      </head>
      <body>
        <h2>BẢNG ĐIỀU KHIỂN BOT AFK</h2>
        <a href="/cmd?c=tpa%20%2B.Minh9948"><button class="tpa">Gửi /tpa cho .Minh9948</button></a><br>
        <a href="/cmd?c=vutdo"><button class="vut">Vứt toàn bộ đồ</button></a>
      </body>
    </html>
  `);
});

app.get('/cmd', (req, res) => {
  const cmd = req.query.c;
  if (global.myBot && cmd) {
    if (cmd === 'vutdo') {
      dropAllItems();
    } else {
      global.myBot.chat(`/${cmd}`);
    }
    res.send(`Đã thực hiện lệnh: /${cmd} <br><br><a href="/">Quay lại</a>`);
  } else {
    res.send('Bot chưa sẵn sàng!');
  }
});

const CONFIG = {
  host: 'tovamc.asia',
  port: 25565,
  username: 'taolatien36677',
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

