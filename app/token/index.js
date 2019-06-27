const config = require('../../config');
const Hash = require('../hash');

class Token {
    /**
     * Генерирует token
     * @param token
     * @return {*}
     */
    static generate(token) {
        const session = require('../session').getInstance();

        if(session.has(token ? token : config.session.tokenName)) {
            return session.get(token ? token : config.session.tokenName);
        } else {
            session.set(token ? token : config.session.tokenName, Hash.md5(Hash.uniqueId()));

            return session.get(token ? token : config.session.tokenName);
        }
    }

    /**
     * Проверяет, совпадает ли текущий токен с токеном, содержащимся в сессии
     * @param token
     * @return {boolean}
     */
    static check(token) {
        const session = require('../session').getInstance();

        const sessionToken = config.session.tokenName;

        if(session.has(sessionToken) && token === session.get(sessionToken)) {
            session.delete(sessionToken);

            return true;
        }

        return false;
    }
}

module.exports = Token;