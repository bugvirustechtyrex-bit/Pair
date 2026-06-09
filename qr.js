const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// ============ BASE24 FUNCTIONS ============
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

function generateBase24Session(sessionString) {
    const base24 = convertToBase24(sessionString);
    return "tyrex24~" + base24;
}

function generateTYREX_ID() {
    const prefix = "TYREX_KSH";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let tyrexID = prefix;
    for (let i = prefix.length; i < 22; i++) {
        tyrexID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return tyrexID;
}

// Thumbnail URL
const THUMBNAIL_URL = 'https://i.ibb.co/0przShNX/Tyrex-Ksh-Tech.jpg';
const CHANNEL_JID = '120363424973782944@newsletter';

router.get('/', async (req, res) => {
    const id = makeid();
    const startTime = Date.now();

    async function TYREX_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const items = ["Safari", "Chrome", "Firefox", "Edge", "Brave", "Opera"];
            const randomItem = items[Math.floor(Math.random() * items.length)];

            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS(randomItem),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                const latency = Date.now() - startTime;
                const performanceLevel = latency < 200 ? "🟢 Excellent" : latency < 500 ? "🟡 Good" : "🔴 Slow";

                try {
                    // send QR code if available
                    if (qr) return await res.end(await QRCode.toBuffer(qr));

                    if (connection == "open") {
                        await delay(3000);
                        let rf = __dirname + `/temp/${id}/creds.json`;

                        const tyrexID = generateTYREX_ID();

                        // ==== Upload session & send message ====
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

                            // send styled message with BOX
                            let text = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
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
┃     tyrex-bit/TYREX_KSH-TKT   ┃
┃  👉 Star & Fork!              ┃
┃                               ┃
┃  👑 OWNER                     ┃
┃  🔗 wa.me/255628378557        ┃
┃                               ┃
┃  ⚡ PERFORMANCE               ┃
┃  🔹 ${performanceLevel}      ┃
┃  🔹 Response: ${latency}ms    ┃
┃  🔹 BASE24: ACTIVE            ┃
┃                               ┃
┃  © Powered By TYREX_KSH TECH  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                            await sock.sendMessage(sock.user.id, {
                                text: text,
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

                            let text = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
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
┃     tyrex-bit/TYREX_KSH-TKT   ┃
┃  👉 Star & Fork!              ┃
┃                               ┃
┃  👑 OWNER                     ┃
┃  🔗 wa.me/255628378557        ┃
┃                               ┃
┃  ⚡ PERFORMANCE               ┃
┃  🔹 ${performanceLevel}      ┃
┃  🔹 Response: ${latency}ms    ┃
┃  🔹 BASE24: ACTIVE            ┃
┃                               ┃
┃  © Powered By TYREX_KSH TECH  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                            await sock.sendMessage(sock.user.id, {
                                text: text,
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

                        // Auto follow channel
                        try {
                            await sock.newsletterFollow(CHANNEL_JID);
                            console.log(`✅ Auto-followed channel: ${CHANNEL_JID}`);
                        } catch (err) {
                            console.log(`⚠️ Could not auto-follow channel: ${err.message}`);
                        }

                        await delay(10);
                        await sock.ws.close();
                        await removeFile('./temp/' + id);
                        console.log(`👤 ${sock.user.id} 🔥 TYREX_KSH TECH Session Connected ✅`);
                        await delay(10);
                        process.exit();
                    }
                } catch (err) {
                    console.log("⚠️ Error in connection.update:", err);
                }

                if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    TYREX_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("⚠️ TYREX_KSH TECH Connection failed — Restarting service...", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ TYREX_KSH TECH Service Unavailable" });
            }
        }
    }

    await TYREX_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("🔄 TYREX_KSH TECH Restarting process...");
    process.exit();
}, 1800000); // 30 minutes

module.exports = router;
