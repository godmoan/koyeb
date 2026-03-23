const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const http = require('http'); // เพิ่มระบบสร้างเว็บ

// --- ส่วนเว็บปลอม (หลอก Koyeb ว่าเราเป็นเว็บและสุขภาพดี) ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Alive!'); // ส่งข้อความกลับไปบอกว่ายังไม่ตาย
});
// Koyeb จะส่งค่า PORT มาให้เรา ถ้าไม่มีให้ใช้ 8000
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`สร้างเว็บปลอมเพื่อหลอก Koyeb สำเร็จที่ Port ${PORT}`);
});
// ------------------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

async function updatePrice() {
    try {
        const nxpcRes = await fetch("https://api.mexc.com/api/v3/ticker/price?symbol=NXPCUSDT");
        const nxpcData = await nxpcRes.json();

        const rateRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const rateData = await rateRes.json();
        const usdtThb = rateData.rates.THB;

        if (!nxpcData.price) throw new Error("ดึงราคาจาก MEXC ไม่สำเร็จ");

        const priceThb = (parseFloat(nxpcData.price) * usdtThb).toLocaleString('th-TH', { 
            minimumFractionDigits: 2, maximumFractionDigits: 2 
        });

        const guild = await client.guilds.fetch(GUILD_ID);
        const botMember = await guild.members.fetchMe();
        
        await botMember.setNickname(`NXPC: ฿${priceThb}`);
        client.user.setActivity(`NXPC Price: ฿${priceThb}`, { type: 3 });

        console.log(`อัปเดตราคาสำเร็จ: ฿${priceThb}`);
    } catch (err) {
        console.error("เกิดข้อผิดพลาด:", err.message);
    }
}

client.once('ready', () => {
    console.log(`บอทออนไลน์แล้ว! ชื่อ: ${client.user.tag}`);
    updatePrice();
    setInterval(updatePrice, 60000); // อัปเดตทุก 1 นาที
});

client.login(DISCORD_TOKEN);
