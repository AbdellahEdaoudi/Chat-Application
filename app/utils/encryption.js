import forge from 'node-forge';
import CryptoJS from 'crypto-js';

/**
 * Encrypts the private key using the user's password.
 * @param {string} privateKeyPem 
 * @param {string} password 
 * @returns {string} Encrypted string
 */
export const encryptPrivateKey = (privateKeyPem, password) => {
    return CryptoJS.AES.encrypt(privateKeyPem, password).toString();
};

/**
 * Decrypts the private key using the user's password.
 * @param {string} encryptedPrivKey 
 * @param {string} password 
 * @returns {string|null} Decrypted PEM string or null if failed
 */
export const decryptPrivateKey = (encryptedPrivKey, password) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPrivKey, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch (e) {
        return null;
    }
};

/**
 * Generates an RSA keypair for End-to-End Encryption.
 * @returns {Promise<{publicKey: string, privateKey: string}>}
 */
export const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
        forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
            if (err) return reject(err);
            resolve({
                publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
                privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
            });
        });
    });
};

/**
 * Encrypts a message using a hybrid encryption approach (AES for data, RSA for keys).
 * @param {string} message - The clear text message.
 * @param {string} recipientPublicKeyPem - The PEM encoded public key of the recipient.
 * @param {string} senderPublicKeyPem - The PEM encoded public key of the sender.
 * @returns {object} - Encrypted message data including IV and encrypted keys.
 */
export const encryptMessage = async (message, recipientPublicKeyPem, senderPublicKeyPem) => {
    // 1. Generate a random AES key and IV
    const aesKey = forge.random.getBytesSync(32); // 256 bits
    const iv = forge.random.getBytesSync(16);

    // 2. Encrypt the message with AES-CBC
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(message)));
    cipher.finish();
    const encryptedMessage = forge.util.encode64(cipher.output.getBytes());

    // 3. Encrypt the AES key with both public keys
    const recipientPublicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);
    const senderPublicKey = forge.pki.publicKeyFromPem(senderPublicKeyPem);

    const recipientEncryptedKey = forge.util.encode64(recipientPublicKey.encrypt(aesKey));
    const senderEncryptedKey = forge.util.encode64(senderPublicKey.encrypt(aesKey));

    return {
        message: encryptedMessage,
        iv: forge.util.encode64(iv),
        recipientEncryptedKey,
        senderEncryptedKey
    };
};

/**
 * Decrypts a message using the private key.
 * @param {object} messageData - The object containing message, iv, and the encrypted key for this user.
 * @param {string} privateKeyPem - The PEM encoded private key.
 * @returns {string} - The decrypted clear text message.
 */
export const decryptMessage = (messageData, privateKeyPem) => {
    try {
        const { message, iv, senderEncryptedKey, recipientEncryptedKey, fromId, userId } = messageData;

        // Choose the correct encrypted key based on whether we are the sender or receiver
        const encryptedKeyBase64 = (fromId === userId) ? senderEncryptedKey : recipientEncryptedKey;

        if (!encryptedKeyBase64 || !iv || !message) return message; // Return as is if not encrypted

        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

        // 1. Decrypt the AES key
        const aesKey = privateKey.decrypt(forge.util.decode64(encryptedKeyBase64));

        // 2. Decrypt the message
        const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        decipher.start({ iv: forge.util.decode64(iv) });
        decipher.update(forge.util.createBuffer(forge.util.decode64(message)));
        const result = decipher.finish();

        if (!result) return "[Decryption Failed]";

        return forge.util.decodeUtf8(decipher.output.getBytes());
    } catch (err) {
        console.error("Decryption error:", err);
        return "[Error Decrypting]";
    }
};
