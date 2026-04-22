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

router.get('/', async (req, res) => {
    const id = makeid();
    const startTime = Date.now();

    async function TYREX_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const items = ["Safari", "Chrome", "Firefox"];
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

                        // ==== Upload session & send message ====
                        try {
                            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                            const string_session = mega_url.replace('https://mega.nz/file/', '');
                            let session_code = "tyrex~" + string_session;

                            // send session code first
                            let code = await sock.sendMessage(sock.user.id, { text: session_code });

                            // send styled message with BOX
                            let text = `┏▣ ◈ *TYREX MD* ◈
┣▣ ✅ SESSION GENERATED
┣▣
┣▣ 📋 SAFETY RULES
┣▣ 🔹 Session ID: Sent above
┣▣ 🔹 ⚠️ Do not share this code!
┣▣ 🔹 Keep this code safe
┣▣ 🔹 Valid for 24 hours only
┣▣
┣▣ 📢 CHANNEL
┣▣ 🔗 https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02
┣▣
┣▣ 💻 REPOSITORY
┣▣ 🔗 https://github.com/bugvirustechtyrex-bit/TyrexBot
┣▣ 👉 Star & Fork!
┣▣
┣▣ ⚡ PERFORMANCE LEVEL
┣▣ 🟢 ${performanceLevel}
┣▣ ⏱️ Response time: ${latency}ms
┣▣
┣▣ © Powered By Tyrex Tech
┗▣`;

                            await sock.sendMessage(sock.user.id, {
                                text: text,
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

                            let text = `┏▣ ◈ *TYREX MD* ◈
┣▣ ⚠️ SESSION WARNING
┣▣
┣▣ 📋 SAFETY RULES
┣▣ 🔹 Session ID: Sent above
┣▣ 🔹 ⚠️ Do not share this code!
┣▣ 🔹 Keep this code safe
┣▣ 🔹 Valid for 24 hours only
┣▣
┣▣ 📢 CHANNEL
┣▣ 🔗 https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02
┣▣
┣▣ 💻 REPOSITORY
┣▣ 🔗 https://github.com/bugvirustechtyrex-bit/TyrexBot
┣▣ 👉 Star & Fork!
┣▣
┣▣ ⚡ PERFORMANCE LEVEL
┣▣ 🟢 ${performanceLevel}
┣▣ ⏱️ Response time: ${latency}ms
┣▣
┣▣ © Powered By Tyrex Tech
┗▣`;

                            await sock.sendMessage(sock.user.id, {
                                text: text,
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
            console.log("⚠️ TYREX MD Connection failed — Restarting service...", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ TYREX MD Service Unavailable" });
            }
        }
    }

    await TYREX_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("🔄 TYREX MD Restarting process...");
    process.exit();
}, 1800000); // 30 minutes

module.exports = router;
