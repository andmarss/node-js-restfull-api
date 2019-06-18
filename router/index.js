const path = require('path');

let instance = null;

let Template = require('../app/template');

/**
 * @class Router
 *
 * @method get
 * @method post
 * @method put
 * @method delete
 * @method setRequest
 * @method setResponse
 * @method setBuffer
 * @method direct
 */
class Router {
    constructor(){
        this._routes = {
            get: {
                _patterns: {}
            },

            post: {
                _patterns: {}
            },

            put: {
                _patterns: {}
            },

            delete: {
                _patterns: {}
            }
        };
        this._request = null;
        this._response = null;
        this._buffer = '';
    }

    /**
     * Регистрирует get запросы
     * @param route
     * @param callback
     */
    get(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            if(Router.routeIsPattern(route)) {
                this._routes.get._patterns[route] = callback;
            } else {
                this._routes.get[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            let [controller, action] = callback.split('@');

            controller = path.join(__dirname, `../app/controllers/${controller}.js`);
            controller = require(controller);
            callback = (new controller)[action];

            if (typeof callback === 'function') {
                if (Router.routeIsPattern(route)) {
                    this._routes.get._patterns[route] = callback;
                } else {
                    this._routes.get[route] = callback;
                }
            }
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

            if(Router.routeIsPattern(route)) {
                this._routes.post._patterns[route] = callback;
            } else {
                this._routes.post[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            let [controller, action] = callback.split('@');

            controller = path.join(__dirname, `../app/controllers/${controller}.js`);
            controller = require(controller);
            callback = (new controller)[action];

            if (typeof callback === 'function') {
                if(Router.routeIsPattern(route)) {
                    this._routes.post._patterns[route] = callback;
                } else {
                    this._routes.post[route] = callback;
                }
            }
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

            if(Router.routeIsPattern(route)) {
                this._routes.put._patterns[route] = callback;
            } else {
                this._routes.put[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            let [controller, action] = callback.split('@');

            controller = path.join(__dirname, `../app/controllers/${controller}.js`);
            controller = require(controller);
            callback = (new controller)[action];

            if (typeof callback === 'function') {
                if(Router.routeIsPattern(route)) {
                    this._routes.put._patterns[route] = callback;
                } else {
                    this._routes.put[route] = callback;
                }
            }
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

            if(Router.routeIsPattern(route)) {
                this._routes.delete._patterns[route] = callback;
            } else {
                this._routes.delete[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            let [controller, action] = callback.split('@');

            controller = path.join(__dirname, `../app/controllers/${controller}.js`);
            controller = require(controller);
            callback = (new controller)[action];

            if (typeof callback === 'function') {
                if(Router.routeIsPattern(route)) {
                    this._routes.delete._patterns[route] = callback;
                } else {
                    this._routes.delete[route] = callback;
                }
            }
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
     * получаем данные, если есть
     * @param buffer
     * @return {Router}
     */
    setBuffer(buffer) {
        if(buffer) {
            this._buffer = buffer;
        }

        return this;
    }

    /**
     * @return {string}
     */
    getBuffer(){
        return this._buffer && typeof this._buffer === 'string'
            ? JSON.parse(this._buffer) : {};
    }

    /**
     * Подготовка объектов запроса и ответа
     */
    _prepare(){
        this._response.json = data => {
            this._response.writeHead(200, {'Content-Type': 'application/json'});

            return JSON.stringify(data);
        };

        this._response.send404 = data => {
            this._response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});

            return data ? data : 'Not Found';
        };

        this._response.send405 = data => {
            this._response.writeHead(405, {'Content-Type': 'text/plain; charset=UTF-8'});

            return data ? data : 'Method Not Allowed';
        };

        this._response.view = (path, data = {}) => {
            this._response.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});

            Template.render(path, data).then(html => {
                this._response.end(html);
            }).catch(err => this._response.end(err.toString()));
        };

        this._request.data = this.getBuffer();

        this._response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
    }

    /**
     * В качестве параметра принимает uri, и http метод
     * Обрабатывает запрос
     * @param uri
     * @param method
     * @return {Router|*}
     */
    direct(uri, method){
        uri = uri.replace(/^\/+|\/+$/g, '');
        // проверяем, есть ли у данного uri паттерн для динамической обработки запросов
        let pattern = this.uriGetPattern(uri, method);
        // подготавливаем объекты запроса и ответа
        this._prepare();

        let callback = this._routes[method.toLowerCase()]._patterns[pattern];

        if(pattern && callback !== undefined && typeof callback === "function") {
            this._request.params = Router.getParams(pattern, uri);
            return callback(this._request, this._response, ...Router.getParamsValues(pattern, uri));
        }

        callback = this._routes[method.toLowerCase()][uri];

        if(callback !== undefined && typeof callback === 'function') {
            callback(this._request, this._response);
        } else {
            return this._response.end(this._response.send405());
        }
    }

    /**
     * Проверяет, является ли переданный маршрут паттерном
     * @param route
     * @return {boolean}
     */
    static routeIsPattern(route){
        if(route && typeof route === 'string') {
            return !!route.toLowerCase().match(/\{([^\{|\}]+)\}/g);
        }

        return false;
    }

    /**
     * Получить объект параметров из динамического маршрута
     * @param route
     * @param uri
     * @return {object}
     */
    static getParams(route, uri) {
        let params = {};

        if(route && typeof route === 'string' && uri && typeof uri === 'string') {
            let keys = Router.getParamsKeys(route);
            let values = Router.getParamsValues(route, uri);

            keys.forEach((key, index) => {
                params[key] = values[index];
            });

            return params;
        }

        return params;
    }

    /**
     * Получить имена параметров из паттерна
     * @param route
     * @return {string[]|Array}
     */
    static getParamsKeys(route){
        if(route && typeof route === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            // разбиваем маршрут, например, /users/find/{id}/another/{user_id} так
            // что бы получить {id} и {user_id}
            // перебираем массив, и убираем фигурные скобки
            // в результате получаем ['id', 'user_id']
            return route.match(/\{([^}]+)\}/g).map(pattern => pattern.match(/\{([^}]+)\}/)[1]);
        }

        return [];
    }

    /**
     * Получить значение параметров из паттерна
     * @param route
     * @param uri
     * @return {string[]|Array}
     */
    static getParamsValues(route, uri) {
        if(route && typeof route === 'string' && uri && typeof uri === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');
            uri = uri.replace(/^\/+|\/+$/g, '');
            // заменяем фигурные скобки на квадратные
            // для регулярного выражения
            // экранируем косые черты
            let pattern = route
                .replace(/\{[^\{\}]+\}/g, '([^\/]+)')
                .replace(/\/+/g, '\\/');

            let regexp = new RegExp(pattern, 'g');

            let result = regexp.exec(uri);

            return result ? result.slice(1) : [];
        }

        return [];
    }

    /**
     * Получить паттерн по ссылке, если есть
     * @param uri
     * @param method
     * @return {boolean|string}
     */
    uriGetPattern(uri, method) {
        let patterns = this._routes[method.toLowerCase()]._patterns;

        if(Object.keys(patterns).length > 0) {
            return Object.keys(patterns).find(pattern => {
                return Router.getParamsValues(pattern, uri).length > 0
            });
        }

        return false;
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