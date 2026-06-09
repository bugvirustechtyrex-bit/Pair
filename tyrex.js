// tyrex.js - Main bot file (if needed)
console.log("TYREX_KSH TECH Bot Starting...");

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>TYREX_KSH TECH</title></head>
        <body style="background:#0a0a1a; color:#00ff88; text-align:center; font-family:monospace;">
            <h1>🤖 TYREX_KSH TECH</h1>
            <p>BASE24 Encrypted System</p>
            <p>Status: ONLINE</p>
            <a href="/qr" style="color:#00ff88;">QR Scan</a> | 
            <a href="/pair" style="color:#00ff88;">Pair Code</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`TYREX_KSH TECH running on port ${PORT}`);
});
