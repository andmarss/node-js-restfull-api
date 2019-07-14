const url = require('url');


class CsrfMiddleware {
    constructor() {
        this.verify = [];
    }

    /**
     *
     * @param request
     * @param response
     * @return {boolean}
     */
    handle(request, response) {
        if(request.method.toLowerCase() !== 'get'
            &&
            !this.isVerify(url.parse(request.url, true).pathname)
            &&
            !request.session.token().check(request.data.token)) {
            throw new Error('Ошибка запроса');
        } else {
            return true;
        }
    }

    isVerify(uri) {
        uri = uri.replace(/^\/|\/$/g, '');
        uri = uri === '' ? '/' : uri;

        let tokensRoutes = this.verify.map(route => {
            return route.replace(/^\/|\/$/g, '');
        });

        if(!tokensRoutes.includes(uri)) {
            tokensRoutes.some(route => {
                route = route === '' ? '/' : route;
                route = route.trim().replace(/\//g, '\\/');

                let regexp = new RegExp(`${route}`);

                return !!uri.match(regexp);
            });
        } else {
            return true;
        }
    }
}

module.exports = CsrfMiddleware;