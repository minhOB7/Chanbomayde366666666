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
global.currentWindow = null; // Lưu menu đang mở

function getShardFromScoreboard(bot) {
  try {
    const scoreboard = bot.scoreboard['sidebar'];
    if (!scoreboard) return 'Chưa tải được bảng Scoreboard!';
    const items = Object.values(scoreboard.itemsMap);
    for (const item of items) {
      const lineText = item.displayName ? item.displayName.toString() : '';
      if (lineText.toLowerCase().includes('shard')) return lineText;
    }
    return 'Không tìm thấy dòng Shard!';
  } catch (err) { return 'Lỗi đọc Scoreboard.'; }
}

function createBot() {
  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.20.4',
    checkTimeoutInterval: 60000
  });

  global.myBot = bot;

  bot.on('spawn', () => {
    setTimeout(() => {
      bot.chat(isFirstJoin ? `/dk ${CONFIG.password_game} ${CONFIG.password_game}` : `/dn ${CONFIG.password_game}`);
      isFirstJoin = false;
    }, 3000);
    setInterval(() => {
      const dirs = ['forward', 'back', 'left', 'right'];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      bot.setControlState(dir, true);
      setTimeout(() => bot.setControlState(dir, false), 1000);
    }, 60000);
  });

  // Ghi lại menu khi bot mở
  bot.on('windowOpen', (window) => { global.currentWindow = window; });
  bot.on('windowClose', () => { global.currentWindow = null; });

  bot.on('chat', (username, message) => {
    if (username.toLowerCase().includes(CONFIG.nick_chinh)) {
      const msg = message.trim().toLowerCase();
      if (msg === 'tpa') bot.chat(`/tpa .Minh9948`);
    }
  });

  bot.on('end', () => setTimeout(createBot, 15000));
}

createBot();

// --- WEB APP ---
app.get('/', (req, res) => {
  let menuHtml = '';
  if (global.currentWindow) {
    menuHtml += `<h3>Menu Đang Mở: ${global.currentWindow.title}</h3><div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">`;
    // Chỉ lấy những ô có đồ (containerItems)
    global.currentWindow.containerItems().forEach(item => {
      menuHtml += `<a href="/cmd?type=click&slot=${item.slot}"><button style="padding:10px; background:#444; border:none; color:white; border-radius:5px;">${item.displayName || 'Item'}</button></a>`;
    });
    menuHtml += `</div><br><a href="/"><button>Làm mới menu</button></a>`;
  } else {
    menuHtml = '<p>Bot chưa mở menu nào cả.</p>';
  }

  res.send(`
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bot Control</title>
      <style>body{background:#121212; color:white; font-family:sans-serif; padding:15px; text-align:center;} button{padding:15px; margin:5px; border:none; border-radius:5px; cursor:pointer; width:90%;}</style>
      </head>
      <body>
        <h2>${CONFIG.username} Control</h2>
        ${menuHtml}
        <hr>
        <a href="/cmd?type=preset&c=tpa"><button style="background:#4CAF50">Gửi /tpa .Minh9948</button></a>
        <a href="/cmd?type=preset&c=shard"><button style="background:#FF9800">Xem số Shard</button></a>
        <form action="/cmd" method="GET"><input type="hidden" name="type" value="custom"><input type="text" name="c" placeholder="Gửi lệnh/chat..." style="padding:10px; width:80%"><button style="background:#9C27B0">Gửi</button></form>
      </body>
    </html>
  `);
});

app.get('/cmd', (req, res) => {
  const { type, c, slot } = req.query;
  if (type === 'click' && global.currentWindow) {
    global.myBot.clickWindow(parseInt(slot), 0, 0);
    res.send(`Đã click ô số ${slot} <br><a href="/">Quay lại</a>`);
  } else if (type === 'preset') {
    if (c === 'tpa') global.myBot.chat(`/tpa .Minh9948`);
    if (c === 'shard') {
        const s = getShardFromScoreboard(global.myBot);
        return res.send(`Shard: ${s} <br><a href="/">Quay lại</a>`);
    }
    res.redirect('/');
  } else if (type === 'custom') {
    global.myBot.chat(c);
    res.redirect('/');
  }
});

app.listen(3000);
        
