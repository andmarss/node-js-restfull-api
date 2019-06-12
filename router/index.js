let instance = null;

class Router {
    constructor(){
        this._getRoutes = {};
        this._postRoutes = {};
        this._putRoutes = {};
        this._deleteRoutes = {};
        this._head = {};
        this._request = null;
        this._response = null;
    }

    /**
     * Регистрирует get запросы
     * @param route
     * @param callback
     */
    get(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            this._getRoutes[route] = callback;
        }
    }

    /**
     * Регистрирует post запросы
     * @param route
     * @param callback
     */
    post(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            this._postRoutes[route] = callback;
        }
    }

    /**
     * Регистрирует put запросы
     * @param route
     * @param callback
     */
    put(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            this._putRoutes[route] = callback;
        }
    }

    /**
     * Регистрирует delete запросы
     * @param route
     * @param callback
     */
    delete(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            this._deleteRoutes[route] = callback;
        }
    }

    /**
     * установить экземпляр запроса сервера
     * @param req
     * @return {Router}
     */
    setRequest(req){
        if(req) {
            this._request = req;
        }

        return this;
    }

    /**
     * установить экзепляр ответа сервера
     * @param res
     * @return {Router}
     */
    setResponse(res){
        if(res) {
            this._response = res;
        }

        return this;
    }

    /**
     * В качестве параметра принимает uri, и http метод
     * @param uri
     * @param method
     * @return {Router|*}
     */
    direct(uri, method){
        uri = uri.replace(/^\/+|\/+$/g, '');

        if(this[`_${method.toLowerCase()}Routes`] !== undefined && typeof this[`_${method.toLowerCase()}Routes`][uri] === 'function') {
            this._response.json = data => {
                this._response.writeHead(200, {'Content-Type': 'application/json'});

                return JSON.stringify(data);
            };
            this._response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
            this._response.end(this[`_${method.toLowerCase()}Routes`][uri](this._request, this._response));
        } else {
            this._response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
            return this._response.end(JSON.stringify({}));
        }
    }

    /**
     * Получить экземпляр роутера
     * @return {*}
     */
    static getInstance(){
        if(!instance) {
            instance = new Router();
        }

        return instance;
    }
}

module.exports = Router.getInstance();