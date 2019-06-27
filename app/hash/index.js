const crypto = require('crypto');
const config = require('../../config');

class Hash {
    static create(value, salt) {
        return crypto.createHmac('sha256', config.hash).update(`${value}${salt}`).digest('hex');
    }

    static salt() {
        return crypto.randomBytes(20).toString('hex');
    }

    static uniqueId() {
        return crypto.randomBytes(32).toString('base64');
    }

    static unique() {
        return Hash.create(Hash.uniqueId(), Hash.salt());
    }

    static make(string) {
        return crypto.createHmac('sha256', config.hash).update(`${string}`).digest('hex');
    }
}

module.exports = Hash;