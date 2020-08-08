const crypto = require('crypto');
const assert = require('assert');

function encrypt(text, key){
    // or any other algorithm supported by OpenSSL
    var cipher = crypto.createCipher('aes256', key);  
    return encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

}

function decrypt(encrypted, key){
    var decipher = crypto.createDecipher('aes256', key);
    return decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = {
    encrypt,
    decrypt
};

