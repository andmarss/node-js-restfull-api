let instance = null;
/**
 *
 * @param host
 * @return {string}
 */
const parseHost = host => {
    if (!host) return 'no-host-name-in-http-headers';
    // если установлен порт - возвращаем значение до него
    let portOffset = host.indexOf(':');
    if(portOffset > -1) host = host.substr(0, portOffset);
    return host;
};

class Cookie extends Map {
    constructor(request, response) {
        super();

        this.host = parseHost(request.headers.host);
        this.request = request;
        this.response = response;
        this.preparedCookies = [];
    }

    /**
     * Разбивает куки, возвращает объект с парами ключ: значение
     * @return {{}|number | string | string[]}
     */
    parseCookie() {
        let { cookie } = this.request.headers;

        if(!cookie) return {};

        let items = cookie.split(';');

        cookie = {};

        for (let item of items) {
            let [key, value] = item.split('=');
            cookie[key] = value.trim();
        }

        super.set('cookie', cookie);

        return cookie;
    }

    get(key) {
        if(!key) {
            return super.get('cookie');
        } else {
            return super.has(key) ? super.get(key) : {};
        }
    }

    set(name, value, expires = 0, httpOnly = false) {
        let { host } = this;
        if(typeof expires === "number") {
            expires = `expires=${expires > 0 ? (new Date(Date.now() + expires)).toISOString() : (new Date(0)).toISOString()}`;
        } else if (typeof expires === "string" && expires.toLowerCase() === 'session') {
            expires = `expires=Session`;
        }
        let cookie = `${name}=${value}; ${expires}; Path=/; Domain=${host}`;
        if(httpOnly) cookie += `; HttpOnly`;

        this.preparedCookies.push(cookie);

        return this;
    }

    /**
     * Подготовить куки для заголовка
     * @return {Cookie}
     */
    send() {
        let {response, preparedCookies} = this;

        if(preparedCookies.length && !response.headersSent) {
            response.setHeader('Set-Cookie', preparedCookies);
        }

        return this;
    }
}

module.exports = Cookie;