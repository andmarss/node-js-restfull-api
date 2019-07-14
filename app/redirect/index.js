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
        let url;

        if(Object.keys(data).length) {
            session.set('redirect', data);
        }

        if(path.search(/ht{2}ps?/)) {
            url = path;
        } else {
            url = `/${path.replace(/^\/|\/$/g, '')}`;
        }

        this.response.writeHead(302, {'Location': url});

        return this.response.end();
    }

    /**
     * Возвращает пользователя на страницу, с которой был произведен запрос
     * @param data
     * @return {*}
     */
    back(data = {}) {
        let url = this.request.session.get('referer') !== undefined
            ? this.request.session.get('referer')
            : '/';

        return this.to(url, data);
    }

    /**
     * Перенаправлят пользователя по имени маршрута
     * @param name
     * @param data
     * @return {*}
     */
    route(name, data = {}) {
        /**
         * @var {Router} router
         */
        let router = require('../../router');

        let url = router.convertRouteToUri(name, data);

        return this.to(url);
    }
}

module.exports = Redirect;