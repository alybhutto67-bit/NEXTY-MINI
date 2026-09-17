/**
 * 👑 NEXTY MINI — Settings
 * ─────────────────────────
 * Sab configuration yahan hai.
 */

module.exports = {
    // ═══ Owner Info ═══
    ownerName: 'NEXTY',                    // ← Ye change karo
    ownerNumber: '923XXXXXXXXX',           // ← Apna number daalo (country code +, no spaces)
    
    // ═══ Bot Info ═══
    botName: 'NEXTY MINI',
    version: '3.0.0',
    prefix: '.',
    
    // ═══ Images ═══
    startimage: 'https://files.catbox.moe/o0798k.png',
    
    // ═══ Channels ═══
    whatsappChannel: 'https://whatsapp.com/channel/0029Vb8RIvDHVvTgHqEiRY1N',
    
    // ═══ Telegram ═══
    tgOwnerId: 'YOUR_TELEGRAM_ID',
    
    // ═══ Users ═══
    premiumUsers: [],
    connectedBots: [],
    
    // ═══ Auto Features ═══
    autoStatus: false,
    autoRead: false,
    autoReact: false,

    // ═══ Persistent Owner Controls ═══
    // Runtime changes are saved under data/ and survive restarts.
    featureDefaults: {
        publicMode: true,
        antidelete: false,
        antiedit: false,
        antistatus: false,
        autoread: false,
        autoview: false,
        autolike: false,
        autodownload: false
    }
};
