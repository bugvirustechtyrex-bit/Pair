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

                    function generateTYREX_ID() {
                        const prefix = "TYREX";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let tyrexID = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            tyrexID += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        return tyrexID;
                    }
                    
                    const tyrexID = generateTYREX_ID();

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let session_code = "tyrex~" + string_session;
                        
                        let code = await sock.sendMessage(sock.user.id, { text: session_code });
                        
                        // ===== Message with BOX for TYREX MD =====
                        let desc =`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃       🤖 TYREX MD 🤖          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  ✅ SESSION GENERATED         ┃
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
┃  © Powered By TYREX TECH      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: 'TYREX MD',
                                    body: '© Tyrex Tech',
                                    thumbnailUrl: 'https://i.ibb.co/PsJQ5wcQ/RD32353637343330363638313140732e77686174736170702e6e6574-634462.jpg',
                                    thumbnailWidth: 64,
                                    thumbnailHeight: 64,
                                    sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                    mediaUrl: 'https://i.ibb.co/PsJQ5wcQ/RD32353637343330363638313140732e77686174736170702e6e6574-634462.jpg',
                                    showAdAttribution: true,
                                    renderLargerThumbnail: false,
                                    previewType: 'PHOTO',
                                    mediaType: 1
                                },
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363424973782944@newsletter',
                                    newsletterName: '✨ TYREX MD ✨',
                                    serverMessageId: Math.floor(Math.random() * 1000000)
                                },
                                isForwarded: true,
                                forwardingScore: 999
                            }
                        }, { quoted: code });

                    } catch (e) {
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let desc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃       🤖 TYREX MD 🤖          ┃
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
┃  © Powered By TYREX TECH      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: 'TYREX MD',
                                    body: '© Tyrex Tech',
                                    thumbnailUrl: 'https://i.ibb.co/PsJQ5wcQ/RD32353637343330363638313140732e77686174736170702e6e6574-634462.jpg',
                                    thumbnailWidth: 64,
                                    thumbnailHeight: 64,
                                    sourceUrl: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
                                    mediaUrl: 'https://i.ibb.co/PsJQ5wcQ/RD32353637343330363638313140732e77686174736170702e6e6574-634462.jpg',
                                    showAdAttribution: true,
                                    renderLargerThumbnail: false,
                                    previewType: 'PHOTO',
                                    mediaType: 1
                                },
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363424973782944@newsletter',
                                    newsletterName: '✨ TYREX MD ✨',
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
                    console.log(`👤 ${sock.user.id} 🔥 TYREX MD Session Connected ✅`);
                    await delay(10);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    TYREX_MD_PAIR_CODE();
                }
            });
            
        } catch (err) {
            console.log("⚠️ TYREX MD Connection failed — Restarting service...");
            await removeFile('./temp/' + id);
            if (!res.headersSent) await res.send({ code: "❗ TYREX MD Service Unavailable" });
        }
    }

    return await TYREX_MD_PAIR_CODE();
});

module.exports = router;
