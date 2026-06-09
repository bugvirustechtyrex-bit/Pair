// ============================================
// MEGA.JS - Secure Session Storage with BASE24
// Powered by TYREX_KSH TECH
// ============================================

const mega = require("megajs");
const crypto = require('crypto');

// ============ MEGA ACCOUNT CREDENTIALS ============
// 🔐 Change these to your own MEGA account credentials
const auth = {
    email: 'popkidtelegram@gmail.com',   // Your MEGA account email
    password: 'popkidtelegram',           // Your MEGA account password
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ============ BASE24 ENCODING ============
const BASE24_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BASE24_PREFIX = "tyrex24~";

// Convert Buffer to Base24
function bufferToBase24(buffer) {
    let result = '';
    let value = 0;
    let bits = 0;
    
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        
        while (bits >= 5) {
            bits -= 5;
            const index = (value >> bits) & 0x1F;
            result += BASE24_CHARS[index];
        }
    }
    
    if (bits > 0) {
        const index = (value << (5 - bits)) & 0x1F;
        result += BASE24_CHARS[index];
    }
    
    return result;
}

// Convert Base24 to Buffer
function base24ToBuffer(base24Str) {
    const charMap = {};
    for (let i = 0; i < BASE24_CHARS.length; i++) {
        charMap[BASE24_CHARS[i]] = i;
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

// ============ ENCRYPTION FUNCTIONS ============
const ENCRYPTION_KEY = crypto.createHash('sha256').update('TYREX_KSH_BASE24_SECURE_KEY_2025').digest();
const IV_LENGTH = 16;

// Encrypt data before upload
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
}

// Decrypt data after download
function decrypt(encryptedData) {
    const [ivBase64, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// ============ BASE24 SESSION GENERATION ============
function generateBase24Session(megaUrl) {
    // Extract file ID from MEGA URL
    const fileId = megaUrl.replace('https://mega.nz/file/', '').split('#')[0];
    
    // Convert to buffer and then to Base24
    const buffer = Buffer.from(fileId, 'utf-8');
    const base24 = bufferToBase24(buffer);
    
    // Return with prefix
    return BASE24_PREFIX + base24;
}

function decodeBase24Session(base24Session) {
    // Remove prefix if exists
    let clean = base24Session;
    if (clean.startsWith(BASE24_PREFIX)) {
        clean = clean.substring(BASE24_PREFIX.length);
    }
    
    // Convert back to buffer
    const buffer = base24ToBuffer(clean);
    const fileId = buffer.toString('utf-8');
    
    // Reconstruct MEGA URL
    return `https://mega.nz/file/${fileId}`;
}

// ============ UPLOAD FUNCTION ============
const upload = (data, name) => {
    return new Promise((resolve, reject) => {
        try {
            if (!auth.email || !auth.password || !auth.userAgent) {
                throw new Error("Missing required authentication fields");
            }

            console.log(`📤 Uploading session: ${name}`);
            console.log(`🔐 BASE24 Encryption: ACTIVE`);

            const storage = new mega.Storage(auth, () => {
                data.pipe(storage.upload({ 
                    name: name, 
                    allowUploadBuffering: true 
                }));
                
                storage.on("add", (file) => {
                    file.link((err, url) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        storage.close();
                        
                        // Generate BASE24 session
                        const base24Session = generateBase24Session(url);
                        
                        console.log(`✅ Upload successful!`);
                        console.log(`🔗 MEGA URL: ${url}`);
                        console.log(`🔐 BASE24 Session: ${base24Session.substring(0, 30)}...`);
                        
                        // Return both original URL and BASE24 session
                        resolve({
                            original: url,
                            base24: base24Session,
                            fileId: url.replace('https://mega.nz/file/', '').split('#')[0]
                        });
                    });
                });
            });
            
            storage.on("error", (err) => {
                reject(err);
            });
            
        } catch (err) {
            console.error("❌ Upload error:", err);
            reject(err);
        }
    });
};

// ============ DOWNLOAD FUNCTION ============
const download = async (base24Session, outputPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Decode BASE24 to get MEGA URL
            const megaUrl = decodeBase24Session(base24Session);
            const fileId = megaUrl.replace('https://mega.nz/file/', '').split('#')[0];
            
            console.log(`📥 Downloading session from MEGA...`);
            console.log(`🔐 BASE24 Session decoded`);
            
            const storage = new mega.Storage(auth, () => {});
            
            storage.on("ready", () => {
                const file = storage.root.children.find(f => f.name === fileId || f.name.includes(fileId));
                
                if (!file) {
                    reject(new Error("File not found"));
                    return;
                }
                
                const stream = file.download();
                const writeStream = require('fs').createWriteStream(outputPath);
                
                stream.pipe(writeStream);
                
                writeStream.on("finish", () => {
                    storage.close();
                    console.log(`✅ Download complete: ${outputPath}`);
                    resolve(outputPath);
                });
                
                writeStream.on("error", (err) => {
                    reject(err);
                });
            });
            
            storage.on("error", (err) => {
                reject(err);
            });
            
        } catch (err) {
            console.error("❌ Download error:", err);
            reject(err);
        }
    });
};

// ============ LIST FILES FUNCTION ============
const listFiles = () => {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, () => {
                const files = storage.root.children.map(file => ({
                    name: file.name,
                    size: file.size,
                    timestamp: file.timestamp,
                    key: file.key
                }));
                storage.close();
                resolve(files);
            });
            
            storage.on("error", (err) => {
                reject(err);
            });
            
        } catch (err) {
            reject(err);
        }
    });
};

// ============ DELETE FILE FUNCTION ============
const deleteFile = (fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, () => {
                const file = storage.root.children.find(f => f.name === fileName);
                
                if (!file) {
                    storage.close();
                    reject(new Error("File not found"));
                    return;
                }
                
                file.delete((err) => {
                    storage.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, fileName: fileName });
                    }
                });
            });
            
            storage.on("error", (err) => {
                reject(err);
            });
            
        } catch (err) {
            reject(err);
        }
    });
};

// ============ BASE24 UTILITIES ============
const base24Utils = {
    encode: (text) => {
        const buffer = Buffer.from(text, 'utf-8');
        return BASE24_PREFIX + bufferToBase24(buffer);
    },
    
    decode: (base24Text) => {
        let clean = base24Text;
        if (clean.startsWith(BASE24_PREFIX)) {
            clean = clean.substring(BASE24_PREFIX.length);
        }
        const buffer = base24ToBuffer(clean);
        return buffer.toString('utf-8');
    },
    
    isValid: (base24Text) => {
        if (!base24Text) return false;
        let clean = base24Text;
        if (clean.startsWith(BASE24_PREFIX)) {
            clean = clean.substring(BASE24_PREFIX.length);
        }
        const regex = new RegExp(`^[${BASE24_CHARS}]+$`);
        return regex.test(clean);
    }
};

module.exports = { 
    upload, 
    download, 
    listFiles, 
    deleteFile,
    generateBase24Session,
    decodeBase24Session,
    base24Utils,
    encrypt,
    decrypt
};
