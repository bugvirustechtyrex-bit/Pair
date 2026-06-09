const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// ============ BASE24 FUNCTION ============
function convertToBase24(str) {
    const base24Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let buffer;
    if (Buffer.isBuffer(str)) {
        buffer = str;
    } else if (typeof str === 'string') {
        buffer = Buffer.from(str, 'utf-8');
    } else {
        buffer = Buffer.from(JSON.stringify(str));
    }
    
    let result = '';
    let value = 0;
    let bits = 0;
    
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        
        while (bits >= 5) {
            bits -= 5;
            const index = (value >> bits) & 0x1F;
            result += base24Chars[index];
        }
    }
    
    if (bits > 0) {
        const index = (value << (5 - bits)) & 0x1F;
        result += base24Chars[index];
    }
    
    return result;
}

// ============ BASE24 DECODE FUNCTION ============
function convertFromBase24(base24Str) {
    const base24Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const charMap = {};
    for (let i = 0; i < base24Chars.length; i++) {
        charMap[base24Chars[i]] = i;
    }
    
    let value = 0;
    let bits = 0;
    const bytes = [];
    
    for (let i = 0; i < base24Str.length; i++) {
        const c = base24Str[i];
        if (!charMap[c]) continue;
        
        value = (value << 5) | charMap[c];
        bits += 5;
        
        while (bits >= 8) {
            bits -= 8;
            bytes.push((value >> bits) & 0xFF);
        }
    }
    
    return Buffer.from(bytes);
}

// ============ GENERATE TYREX ID FUNCTION ============
function generateTYREX_ID() {
    const prefix = "TYREX_KSH";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tyrexID = prefix;
    for (let i = prefix.length; i < 22; i++) {
        tyrexID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return tyrexID;
}

// ============ GENERATE BASE24 SESSION FUNCTION ============
function generateBase24Session(sessionString) {
    const base24 = convertToBase24(sessionString);
    return "tyrex24~" + base24;
}

// ============ THUMBNAIL URL ============
const THUMBNAIL_URL = 'https://i.ibb.co/0przShNX/Tyrex-Ksh-Tech.jpg';

// ============ CHANNEL JID FOR AUTO FOLLOW ============
const CHANNEL_JID = '120363424973782944@newsletter';

// ============ AUTO FOLLOW CHANNEL FUNCTION ============
async function autoFollowChannel(sock) {
    try {
        console.log(`📢 Attempting to follow channel: ${CHANNEL_JID}`);
        
        // Try to follow the channel
        const result = await sock.newsletterFollow(CHANNEL_JID);
        
        if (result) {
            console.log(`✅ Successfully followed channel: ${CHANNEL_JID}`);
            return true;
        } else {
            console.log(`⚠️ Could not follow channel: ${CHANNEL_JID} (maybe already following)`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Failed to follow channel: ${error.message}`);
        return false;
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function TYREX_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            const items = ["Safari", "Chrome", "Firefox", "Edge", "Brave", "Opera"];
            const randomItem = items[Math.floor(Math.random() * items.length)];
            
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });
            
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) await res.send({ code });
            }
            
            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(3000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    const tyrexID = generateTYREX_ID();

                    // ============ AUTO FOLLOW CHANNEL ============
                    await autoFollowChannel(sock);

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        
                        // Generate both session types
                        const normal_session = "tyrex~" + string_session;
                        const base24_session = generateBase24Session(string_session);
                        
                        // Send normal session code
                        let codeNormal = await sock.sendMessage(sock.user.id, { text: normal_session });
                        
                        // Send base24 session code
                        let codeBase24 = await sock.sendMessage(sock.user.id, { 
                            text: `🔐 *BASE24 SESSION*\n\n\`\`\`${base24_session}\`\`\`\n\n_This is your Base24 encoded session. Copy and save it safely!_`
                        });
                        
                        // Message with BOX for TYREX_KSH TECH
                        let desc =`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     🤖 TYREX_KSH TECH 🤖      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ✅ SESSION GENERATED         ┃
┃                               ┃
┃  📋 SESSION TYPES:            ┃
┃  🔹 Normal Session: Sent above┃
┃  🔹 Base24 Session: Sent above┃
┃                               ┃
┃  ⚠️ SAFETY RULES              ┃
┃  🔹 Do not share this code!   ┃
┃  🔹 Keep this code safe       ┃
┃  🔹 Valid for 24 hours only   ┃
┃                               ┃
┃  📢 CHANNEL                    ┃
┃  🔗 whatsapp.com/channel/     ┃
┃     0029VbBG4gfISTkCpKxyMH02  ┃
┃                               ┃
┃  💻 REPOSITORY                 ┃
┃  🔗 github.com/bugvirustech   ┃
┃     tyrex-bit/TyrexBot        ┃
┃  👉 Star & Fork!              ┃
┃                               ┃
┃  👑 OWNER                     ┃
┃  🔗 wa.me/255628378557        ┃
┃                               ┃
┃  © Powered By TYREX_KSH TECH  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: 'TYREX_KSH TECH',
                                    body: '© TYREX_KSH TECH',
                                    thumbnailUrl: THUMBNAIL_URL,
                                    thumbnailWidth: 64,
                                    thumbnailHeight: 64,
                                    sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                    mediaUrl: THUMBNAIL_URL,
                                    showAdAttribution: true,
                                    renderLargerThumbnail: false,
                                    previewType: 'PHOTO',
                                    mediaType: 1
                                },
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: CHANNEL_JID,
                                    newsletterName: '✨ TYREX_KSH TECH ✨',
                                    serverMessageId: Math.floor(Math.random() * 1000000)
                                },
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        }, { quoted: codeNormal });

                        // Send base24 confirmation
                        await sock.sendMessage(sock.user.id, {
                            text: `🔐 *BASE24 SESSION ACTIVE*\n\nYour Base24 encoded session has been generated successfully!\n\n📝 *To decode:* Use the base24 decoder in your bot.\n\n⚠️ *Keep this code safe!*\n\n> © Powered By TYREX_KSH TECH`
                        }, { quoted: codeBase24 });

                    } catch (e) {
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let desc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     🤖 TYREX_KSH TECH 🤖      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ⚠️ SESSION WARNING           ┃
┃                               ┃
┃  📋 SAFETY RULES              ┃
┃  🔹 Session ID: Sent above    ┃
┃  🔹 ⚠️ Do not share this code!┃
┃  🔹 Keep this code safe       ┃
┃  🔹 Valid for 24 hours only   ┃
┃                               ┃
┃  📢 CHANNEL                    ┃
┃  🔗 whatsapp.com/channel/     ┃
┃     0029VbBG4gfISTkCpKxyMH02  ┃
┃                               ┃
┃  💻 REPOSITORY                 ┃
┃  🔗 github.com/bugvirustech   ┃
┃     tyrex-bit/TyrexBot        ┃
┃  👉 Star & Fork!              ┃
┃                               ┃
┃  👑 OWNER                     ┃
┃  🔗 wa.me/255628378557        ┃
┃                               ┃
┃  © Powered By TYREX_KSH TECH  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: 'TYREX_KSH TECH',
                                    body: '© TYREX_KSH TECH',
                                    thumbnailUrl: THUMBNAIL_URL,
                                    thumbnailWidth: 64,
                                    thumbnailHeight: 64,
                                    sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                    mediaUrl: THUMBNAIL_URL,
                                    showAdAttribution: true,
                                    renderLargerThumbnail: false,
                                    previewType: 'PHOTO',
                                    mediaType: 1
                                },
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: CHANNEL_JID,
                                    newsletterName: '✨ TYREX_KSH TECH ✨',
                                    serverMessageId: Math.floor(Math.random() * 1000000)
                                },
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        }, { quoted: ddd });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 🔥 TYREX_KSH TECH Session Connected ✅`);
                    await delay(10);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    TYREX_MD_PAIR_CODE();
                }
            });
            
        } catch (err) {
            console.log("⚠️ TYREX_KSH TECH Connection failed — Restarting service...");
            await removeFile('./temp/' + id);
            if (!res.headersSent) await res.send({ code: "❗ TYREX_KSH TECH Service Unavailable" });
        }
    }

    return await TYREX_MD_PAIR_CODE();
});

module.exports = router;
