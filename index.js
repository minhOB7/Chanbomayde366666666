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
  // 1. Giao diện Menu GUI
  let menuHtml = '';
  if (global.currentWindow) {
    menuHtml += `<h3>Menu Đang Mở: ${global.currentWindow.title}</h3><div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">`;
    global.currentWindow.containerItems().forEach(item => {
      menuHtml += `<a href="/cmd?type=click&slot=${item.slot}"><button style="padding:10px; background:#444; border:none; color:white; border-radius:5px;">${item.displayName || 'Item'}</button></a>`;
    });
    menuHtml += `</div><br><a href="/"><button style="background:#555; color:white;">Làm mới menu</button></a>`;
  } else {
    menuHtml = '<p style="color:#aaa;">Bot chưa mở menu nào cả.</p>';
  }

  // 2. Giao diện Túi đồ (Inventory)
  let inventoryHtml = '';
  if (global.myBot && global.myBot.inventory) {
    const items = global.myBot.inventory.items();
    if (items.length > 0) {
      inventoryHtml += '<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">';
      items.forEach(item => {
        inventoryHtml += `
          <div style="background:#222; padding:10px; border-radius:5px; border:1px solid #444;">
            <p style="margin:0 0 5px 0;"><b>${item.displayName}</b> (x${item.count})</p>
            <a href="/cmd?type=drop_single&slot=${item.slot}"><button style="padding:5px 10px; background:#e53935; color:white; border:none; border-radius:3px; cursor:pointer; width:auto;">Vứt món này</button></a>
          </div>`;
      });
      inventoryHtml += '</div>';
    } else {
      inventoryHtml = '<p style="color:#aaa;">Túi đồ đang trống.</p>';
    }
  } else {
    inventoryHtml = '<p style="color:#aaa;">Chưa tải được túi đồ.</p>';
  }

  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bot Control</title>
        <style>
          body{background:#121212; color:white; font-family:sans-serif; padding:15px; text-align:center;} 
          button{padding:15px; margin:5px; border:none; border-radius:5px; cursor:pointer; width:90%; font-size:16px;}
          hr{border:1px solid #333; margin:20px 0;}
          input{padding:12px; width:80%; font-size:16px; border-radius:5px; border:none;}
        </style>
      </head>
      <body>
        <h2>${CONFIG.username} Control</h2>
        
        ${menuHtml}
        
        <hr>
        <h3>TÚI ĐỒ BẢN THÂN</h3>
        <a href="/cmd?type=drop_all"><button style="background:#d32f2f; color:white; font-weight:bold;">Vứt Toàn Bộ Đồ</button></a>
        <br><br>
        ${inventoryHtml}

        <hr>
        <a href="/cmd?type=preset&c=tpa"><button style="background:#4CAF50; color:white;">Gửi /tpa .Minh9948</button></a>
        <a href="/cmd?type=preset&c=shard"><button style="background:#FF9800; color:white;">Xem số Shard</button></a>
        
        <hr>
        <form action="/cmd" method="GET">
          <input type="hidden" name="type" value="custom">
          <input type="text" name="c" placeholder="Gửi lệnh/chat...">
          <button style="background:#9C27B0; color:white; margin-top:10px;">Gửi Lệnh</button>
        </form>
      </body>
    </html>
  `);
});

app.get('/cmd', async (req, res) => {
  const { type, c, slot } = req.query;
  if (!global.myBot) return res.send('Bot chưa sẵn sàng! <br><a href="/">Quay lại</a>');

  if (type === 'click' && global.currentWindow) {
    global.myBot.clickWindow(parseInt(slot), 0, 0);
    res.send(`Đã click ô số ${slot} <br><a href="/">Quay lại</a>`);
  } else if (type === 'drop_all') {
    if (global.myBot.inventory) {
      const items = global.myBot.inventory.items();
      for (const item of items) {
        try {
          await global.myBot.tossStack(item);
        } catch (err) {}
      }
    }
    res.send(`Đã vứt toàn bộ đồ! <br><a href="/">Quay lại</a>`);
  } else if (type === 'drop_single') {
    if (global.myBot.inventory && slot !== undefined) {
      const item = global.myBot.inventory.items().find(i => i.slot === parseInt(slot));
      if (item) {
        try {
          await global.myBot.tossStack(item);
        } catch (err) {}
      }
    }
    res.redirect('/');
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
                    
