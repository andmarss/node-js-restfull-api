let instance = null;

class Redirect {
    /**
     * @param request
     * @param response
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }

    /**
     * На какую страницу будет переведен пользователь
     * @param path
     * @param data
     * @return {*}
     */
    to(path, data = {}){
        const session = require('../session').getInstance();

        if(Object.keys(data).length) {
            session.set('redirect', data);
        }

        let url = `/${path.replace(/^\/|\/$/g, '')}`;

        this.response.writeHead(302, {'Location': url});

        return this.response.end();
    }

    /**
     * Возвращает пользователя на страницу, с которой был произведен запрос
     * @param data
     * @return {*}
     */
    back(data = {}) {
        let url = this.request.headers['referer'] !== undefined
            ? this.request.headers['referer'] : '/';

        return this.to(url, data);
    }

    /**
     * Перенаправлят пользователя по имени маршрута
     * @param name
     * @param data
     * @return {*}
     */
    route(name, data = {}) {
        let router = require('../../router');

        let url = router.convertRouteToUri(name);

        return this.to(url, data);
    }

    /**
     * @param request
     * @param response
     * @return {*}
     */
    static getInstance(request, response) {
        if(!instance) {
            instance = new Redirect(request, response);
        }

        return instance;
    }
}

module.exports = Redirect;