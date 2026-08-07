const mineflayer = require('mineflayer');
const express = require('express');

const app = express();

const CONFIG = {
  host: 'tovamc.asia',
  port: 25565,
  username: 'taolatien36677',
  password_game: 'chanbomayde123456',
  nick_chinh: 'minh9948'
};

let isFirstJoin = true;

function getShardFromScoreboard(bot) {
  try {
    const scoreboard = bot.scoreboard['sidebar'];
    if (!scoreboard) return 'Chưa tải được bảng Scoreboard!';

    const items = Object.values(scoreboard.itemsMap);
    for (const item of items) {
      const lineText = item.displayName ? item.displayName.toString() : '';
      if (lineText.toLowerCase().includes('shard')) {
        return lineText;
      }
    }
    return 'Không tìm thấy dòng Shard trên Scoreboard!';
  } catch (err) {
    return 'Lỗi khi đọc Scoreboard: ' + err.message;
  }
}

function createBot() {
  console.log('-> Dang khoi tao va ket noi bot den server...');
  
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.20.4',
    checkTimeoutInterval: 60000
  });

  global.myBot = bot;

  function dropAllItems() {
    console.log('-> Dang vut do...');
    if (bot.inventory) {
      bot.inventory.items().forEach(item => bot.tossStack(item));
    }
  }

  bot.on('spawn', () => {
    console.log('-> BOT DA VAO SERVER THANH CONG!');

    setTimeout(() => {
      bot.chat(isFirstJoin ? `/dk ${CONFIG.password_game} ${CONFIG.password_game}` : `/dn ${CONFIG.password_game}`);
      console.log('-> Da gui lenh dang nhap/dang ky');
      isFirstJoin = false;
    }, 3000);

    setTimeout(() => {
      bot.chat('/afk');
      console.log('-> Da gui lenh /afk');
    }, 7000);

    // CHỐNG AFK: Di chuyển ngẫu nhiên 1 phút/lần
    const directions = ['forward', 'back', 'left', 'right'];
    setInterval(() => {
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      bot.setControlState(randomDir, true);
      setTimeout(() => bot.setControlState(randomDir, false), 1000);
      console.log('-> Di chuyen chong AFK');
    }, 60000); 
  });

  bot.on('windowOpen', async (window) => {
    try { 
      await bot.clickWindow(0, 0, 0); 
      console.log('-> Da click menu AFK');
    } catch (err) {}
  });

  bot.on('chat', (username, message) => {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanUsername.includes(CONFIG.nick_chinh)) {
      const msg = message.trim().toLowerCase();
      if (msg === 'vutdo') dropAllItems();
      else if (msg === 'tpa') bot.chat(`/tpa .Minh9948`);
      else if (msg === 'shard') {
        const shardInfo = getShardFromScoreboard(bot);
        bot.chat(shardInfo);
      }
      else if (msg.startsWith('code ')) bot.chat(`/code ${message.substring(5)}`);
    }
  });

  bot.on('kicked', (reason) => console.log('-> Server kick bot:', JSON.stringify(reason)));
  bot.on('end', () => {
    console.log('-> Bot mat ket noi! Vao lai sau 15s...');
    setTimeout(createBot, 15000);
  });
  bot.on('error', (err) => console.log('Loi Bot:', err.message));
}

createBot();

// GIAO DIỆN WEB CONTROL
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot Control</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 20px; background: #121212; color: white; }
          button { padding: 15px 25px; margin: 10px; font-size: 18px; border: none; border-radius: 8px; cursor: pointer; display: block; width: 90%; margin: 10px auto; }
          .tpa { background: #4CAF50; color: white; }
          .vut { background: #f44336; color: white; }
          .shard { background: #FF9800; color: white; }
          .code { background: #2196F3; color: white; }
          .send { background: #9C27B0; color: white; }
          input { padding: 12px; width: 85%; border-radius: 5px; border: none; margin-bottom: 10px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h2>ĐIỀU KHIỂN BOT (${CONFIG.username})</h2>
        <a href="/cmd?type=preset&c=tpa"><button class="tpa">Gửi /tpa .Minh9948</button></a>
        <a href="/cmd?type=preset&c=shard"><button class="shard">Xem số Shard hiện tại</button></a>
        <a href="/cmd?type=preset&c=vutdo"><button class="vut">Vứt toàn bộ đồ</button></a>
        <hr>
        <h3>Nhập Code</h3>
        <form action="/cmd" method="GET">
          <input type="hidden" name="type" value="code">
          <input type="text" name="c" placeholder="Nhập mã code...">
          <button class="code">Nhập Code</button>
        </form>
        <hr>
        <h3>Gửi Lệnh / Chat Bất Kỳ</h3>
        <form action="/cmd" method="GET">
          <input type="hidden" name="type" value="custom">
          <input type="text" name="c" placeholder="Ví dụ: /afk hoặc hi all...">
          <button class="send">Gửi Vào Game</button>
        </form>
      </body>
    </html>
  `);
});

app.get('/cmd', (req, res) => {
  const cmd = req.query.c;
  const type = req.query.type;

  if (global.myBot && cmd) {
    if (type === 'preset') {
      if (cmd === 'vutdo') {
        if (global.myBot.inventory) global.myBot.inventory.items().forEach(i => global.myBot.tossStack(i));
        res.send(`Đã thực hiện: Vứt đồ <br><br><a href="/">Quay lại</a>`);
      } else if (cmd === 'tpa') {
        global.myBot.chat(`/tpa .Minh9948`);
        res.send(`Đã thực hiện: /tpa .Minh9948 <br><br><a href="/">Quay lại</a>`);
      } else if (cmd === 'shard') {
        const shardResult = getShardFromScoreboard(global.myBot);
        res.send(`<h3>Thông tin Shard:</h3> <p style="font-size:20px; color:orange;">${shardResult}</p> <br><a href="/">Quay lại</a>`);
      }
    } else if (type === 'code') {
      global.myBot.chat(`/code ${cmd}`);
      res.send(`Đã nhập code: /code ${cmd} <br><br><a href="/">Quay lại</a>`);
    } else if (type === 'custom') {
      global.myBot.chat(cmd);
      res.send(`Đã gửi vào game: ${cmd} <br><br><a href="/">Quay lại</a>`);
    }
  } else {
    res.send('Bot chưa sẵn sàng! Vui lòng thử lại sau vài giây.');
  }
});

app.listen(3000, () => console.log('Web server ready!'));

