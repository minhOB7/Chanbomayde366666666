const mineflayer = require('mineflayer');
const express = require('express');

const app = express();

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

const CONFIG = {
  host: 'tovamc.asia',
  port: 25565,
  username: 'VietNam_Gamer2026',
  password_game: 'chanbomayde123456',
  nick_chinh: 'minh9948'
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

  global.myBot = bot;

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

    // CHỐNG AFK: Di chuyển ngẫu nhiên (tiến, lùi, trái, phải) mỗi 20 giây
    const directions = ['forward', 'back', 'left', 'right'];
    setInterval(() => {
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(randomDir, true);
      
      setTimeout(() => {
        bot.setControlState(randomDir, false);
      }, 1000); // Di chuyển trong 1 giây rồi dừng
    }, 20000);
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
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanUsername.includes(CONFIG.nick_chinh.toLowerCase())) {
      const msg = message.trim().toLowerCase();
      
      if (msg === 'vutdo') {
        dropAllItems();
      } else if (msg === 'tpa') {
        bot.chat(`/tpa ${username}`);
        console.log(`-> Da gui /tpa cho ${username}`);
      } else if (msg.startsWith('code ')) {
        const codeInput = message.replace(/code /i, '').trim();
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

app.get('/cmd', (req, res) => {
  const cmd = req.query.c;
  if (global.myBot && cmd) {
    if (cmd === 'vutdo') {
      if (global.myBot.inventory) {
        global.myBot.inventory.items().forEach(item => global.myBot.tossStack(item));
      }
    } else {
      global.myBot.chat(`/${cmd}`);
    }
    res.send(`Đã thực hiện lệnh: /${cmd} <br><br><a href="/">Quay lại</a>`);
  } else {
    res.send('Bot chưa sẵn sàng!');
  }
});

app.listen(3000, () => console.log('Web server ready!'));

createBot();
