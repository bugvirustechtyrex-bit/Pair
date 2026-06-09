const express = require('express');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const path = require('path');
const PORT = process.env.PORT || 8000;

// Import route handlers
let server = require('./qr');
let code = require('./pair');

// Increase event listeners limit
require('events').EventEmitter.defaultMaxListeners = 500;

// ============ MIDDLEWARE ============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__path + '/public'));

// ============ CORS HEADERS ============
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// ============ LOGGING MIDDLEWARE ============
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ============ API ROUTES ============
// QR Code route
app.use('/server', server);

// Pairing code route
app.use('/code', code);

// ============ HTML PAGE ROUTES ============
// Pair page
app.use('/pair', async (req, res, next) => {
    try {
        res.sendFile(__path + '/pair.html');
    } catch (error) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>TYREX_KSH TECH - Pair Page</title></head>
            <body style="background:#0a0a1a; color:#00ff88; text-align:center; padding:50px; font-family:monospace;">
                <h1>🤖 TYREX_KSH TECH</h1>
                <p>Pair page not found. Please upload pair.html</p>
                <p>🔐 BASE24 Ready</p>
            </body>
            </html>
        `);
    }
});

// QR page
app.use('/qr', async (req, res, next) => {
    try {
        res.sendFile(__path + '/qr.html');
    } catch (error) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>TYREX_KSH TECH - QR Page</title></head>
            <body style="background:#0a0a1a; color:#00ff88; text-align:center; padding:50px; font-family:monospace;">
                <h1>📱 TYREX_KSH TECH</h1>
                <p>QR page not found. Please upload qr.html</p>
                <p>🔐 BASE24 Ready</p>
            </body>
            </html>
        `);
    }
});

// Main page (Dashboard)
app.use('/', async (req, res, next) => {
    try {
        res.sendFile(__path + '/main.html');
    } catch (error) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TYREX_KSH TECH | Dashboard</title>
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        min-height: 100vh;
                        background: radial-gradient(ellipse at 20% 30%, #0a0a1a, #030308);
                        font-family: 'Orbitron', monospace;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: #00ff88;
                    }
                    .container {
                        text-align: center;
                        padding: 40px;
                        background: rgba(8, 12, 25, 0.7);
                        backdrop-filter: blur(20px);
                        border-radius: 40px;
                        border: 1px solid rgba(0, 255, 136, 0.3);
                        max-width: 500px;
                        margin: 20px;
                        animation: floatIn 0.8s ease-out;
                    }
                    @keyframes floatIn {
                        0% { opacity: 0; transform: translateY(50px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 10px;
                        background: linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                        animation: textFlow 3s linear infinite;
                    }
                    @keyframes textFlow {
                        0% { background-position: 0% center; }
                        100% { background-position: 200% center; }
                    }
                    .subtitle {
                        color: #888;
                        margin-bottom: 30px;
                        letter-spacing: 2px;
                    }
                    .btn-group {
                        display: flex;
                        gap: 20px;
                        justify-content: center;
                        flex-wrap: wrap;
                        margin: 30px 0;
                    }
                    .btn {
                        padding: 14px 28px;
                        background: linear-gradient(90deg, #00ff88, #00f7ff);
                        border: none;
                        border-radius: 40px;
                        color: #000;
                        font-weight: bold;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        font-family: 'Orbitron', monospace;
                    }
                    .btn:hover {
                        transform: scale(1.05);
                        box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
                    }
                    .status {
                        margin-top: 20px;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 20px;
                        font-size: 0.8rem;
                    }
                    .status-dot {
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        background: #00ff88;
                        border-radius: 50%;
                        animation: pulse 1.5s infinite;
                        margin-right: 8px;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.2); }
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 0.6rem;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="status-dot"></div>
                    <h1>TYREX_KSH TECH</h1>
                    <div class="subtitle">BASE24 • SECURE • NEXTGEN</div>
                    <div class="btn-group">
                        <a href="/qr" class="btn">📱 QR SCAN</a>
                        <a href="/pair" class="btn">🔐 PAIR CODE</a>
                    </div>
                    <div class="status">
                        <div>🚀 System: ONLINE</div>
                        <div>🔐 BASE24: ACTIVE</div>
                        <div>🔄 Auto Follow: ENABLED</div>
                        <div>⚡ v6.0.0 ULTRA</div>
                    </div>
                    <div class="footer">
                        © 2025-2026 TYREX_KSH TECH | Powered by BASE24 Encryption
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

// ============ FALLBACK ROUTE (404) ============
app.use('*', (req, res) => {
    res.status(404).json({
        status: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        bot: "TYREX_KSH TECH",
        version: "6.0.0"
    });
});

// ============ HEALTH CHECK ROUTE ============
app.get('/health', (req, res) => {
    res.json({
        status: "online",
        bot: "TYREX_KSH TECH",
        version: "6.0.0",
        base24: "active",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ████████╗██╗   ██╗██████╗ ███████╗██╗  ██╗    ██╗  ██╗   ║
║   ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝╚██╗██╔╝    ██║ ██╔╝   ║
║      ██║    ╚████╔╝ ██████╔╝█████╗   ╚███╔╝     █████╔╝    ║
║      ██║     ╚██╔╝  ██╔══██╗██╔══╝   ██╔██╗     ██╔═██╗    ║
║      ██║      ██║   ██║  ██║███████╗██╔╝ ██╗    ██║  ██╗   ║
║      ╚═╝      ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝   ║
║                                                              ║
║            ███╗   ███╗██████╗                               ║
║            ████╗ ████║██╔══██╗                              ║
║            ██╔████╔██║██║  ██║                              ║
║            ██║╚██╔╝██║██║  ██║                              ║
║            ██║ ╚═╝ ██║██████╔╝                              ║
║            ╚═╝     ╚═╝╚═════╝                               ║
║                                                              ║
║   🧛 TYREX_KSH TECH v6.0.0 - BASE24 ULTRA                   ║
║   ⚡ POWERED BY TYREX_KSH TECH                               ║
║   🔐 BASE24 ENCRYPTION: ACTIVE                               ║
║   🔄 AUTO FOLLOW CHANNEL: ENABLED                            ║
║                                                              ║
║   📡 Server running on:                                      ║
║   🔗 http://localhost:${PORT}                                ║
║   🔗 http://0.0.0.0:${PORT}                                  ║
║                                                              ║
║   📋 Available Routes:                                      ║
║   🔹 /      - Main Dashboard                                ║
║   🔹 /qr    - QR Code Scan Page                             ║
║   🔹 /pair  - Pair Code Page                                ║
║   🔹 /code  - Pair Code API                                 ║
║   🔹 /server - QR Code API                                  ║
║   🔹 /health - Health Check                                 ║
║                                                              ║
║   © 2025-2026 TYREX_KSH TECH                                ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
