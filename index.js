const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

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

        // คำนวณราคาเดิมก่อน (1 NXPC)
        const rawPriceThb = parseFloat(nxpcData.price) * usdtThb;
        
        // เอามาคูณ 10 ตามที่พี่ต้องการ
        const multipliedPrice = rawPriceThb * 10;

        // แปลงเป็นตัวเลขที่มีลูกน้ำและทศนิยม 2 ตำแหน่ง
        const formattedPrice = multipliedPrice.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, maximumFractionDigits: 2 
        });

        const guild = await client.guilds.fetch(GUILD_ID);
        const botMember = await guild.members.fetchMe();
        
        // อัปเดตชื่อบอทตามรูปแบบที่ต้องการ
        await botMember.setNickname(`[NXPC] 1m = ${formattedPrice}`);
        
        // อัปเดตสถานะบอท (ตัวหนังสือเล็กๆ ด้านล่างชื่อ) ให้ล้อกันไปด้วย
        client.user.setActivity(`1m = ${formattedPrice} THB`, { type: 3 }); 

        console.log(`อัปเดตราคาสำเร็จ: [NXPC] 1m = ${formattedPrice}`);
    } catch (err) {
        console.error("เกิดข้อผิดพลาด:", err.message);
    }
}

client.once('ready', () => {
    console.log(`บอทออนไลน์แล้ว! ชื่อ: ${client.user.tag}`);
    updatePrice();
    setInterval(updatePrice, 60000); // วนลูปอัปเดตทุก 1 นาที
});

client.login(DISCORD_TOKEN);
