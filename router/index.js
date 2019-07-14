const path = require('path');
const { asset, rebindMiddleware } = require('../helpers/index');

let instance = null;

const Template = require('../app/template');
const Pluraliser = require('../app/pluralizer');

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
        this._where = {};
        this._route = '';
        this._names = {};
        this._middlewares = {};
        this._method = '';
    }

    /**
     * Регистрирует get запросы
     * @param route
     * @param callback
     */
    get(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'get';

            if(Router.routeIsPattern(route)) {
                this._routes.get._patterns[route] = callback;
            } else {
                this._routes.get[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'get';

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

        return this;
    }

    /**
     * Регистрирует post запросы
     * @param route
     * @param callback
     */
    post(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'post';

            if(Router.routeIsPattern(route)) {
                this._routes.post._patterns[route] = callback;
            } else {
                this._routes.post[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'post';

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

        return this;
    }

    /**
     * Регистрирует put запросы
     * @param route
     * @param callback
     */
    put(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'put';

            if(Router.routeIsPattern(route)) {
                this._routes.put._patterns[route] = callback;
            } else {
                this._routes.put[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'put';

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

        return this;
    }

    /**
     * Регистрирует delete запросы
     * @param route
     * @param callback
     */
    delete(route, callback){
        if(route && callback && typeof route === 'string' && typeof callback === 'function') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'delete';

            if(Router.routeIsPattern(route)) {
                this._routes.delete._patterns[route] = callback;
            } else {
                this._routes.delete[route] = callback;
            }
        } else if (route && callback && typeof route === 'string' && typeof callback === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');

            route = route === '' ? '/' : route;

            this._route = route;
            this._method = 'delete';

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

        return this;
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

        this._response.loadAsset = path => {
            this.prepareHeader(path);

            asset(path)
                .then(data => {
                    this._response.end(data);
                })
                .catch(err => {
                    this._response.writeHead(405, {'Content-Type': 'text/plain; charset=UTF-8'});

                    this._response.end(err.toString());
                });
        };
    }

    /**
     * Парсим тело запроса, получаем объект
     * @param body
     * @return {Router}
     */
    parseBody(body) {
        let data = {};
        let contentType = this._request.headers['content-type'];

        if(contentType && contentType.match(/multipart\/form\-data/)) {
            // получаем ключи ч-з регулярное выражение, получим массив типа name="key"
            let keys = body.match(/(name\=\"([^\"]+)\")/g);
            // получаем значения ч-з регулярное выражение, получаем значение с отступами по бокам
            let values = body.match(/\r\n\r\n([^\r\n]+)\r\n/g);

            if(keys && keys.length && values && values.length) {
                // убираем ковычки у ключей, и разбиваем name=key по разделителю =
                // возвращаем значения справа от разделителя - получаем имя ключа
                keys = keys.map(key => key.replace(/[\'|\"]+/g, '').split('=')[1]);
                // убираем отступы по бокам
                values = values.map(value => value.trim());

                keys.forEach((key, index) => {
                    // декодируем спецсимволы внутри значения
                    data[key] = decodeURIComponent(values[index]);
                });

                this._request.data = data;
            } else {
                this._request.data = data;
            }
        } else if (contentType === 'application/x-www-form-urlencoded') {
            // разбиваем тело запроса по разделителю &
            // получаем массив ['key=value', 'key=value']
            let splited = body.split(/\&/g);

            if(splited.length) {
                splited.forEach(item => {
                    // разбиваем элемент по разделителю =
                    let [key, value] = item.split('=');
                    // декодируем спецсимволы внутри значения
                    data[key] = decodeURIComponent(value);
                });
            }

            this._request.data = data;
        } else if (contentType === 'application/json') {
            if(typeof body === "string") {
                // декодируем спецсимволы внутри значения
                this._request.data = JSON.parse(decodeURIComponent(body));
            } else {
                this._request.data = {};
            }
        }

        return this;
    }

    /**
     * В качестве параметра принимает uri, и http метод
     * Обрабатывает запрос
     * @param uri
     * @param method
     * @return {Router|*}
     */
    direct(uri, method){
        // подготавливаем объекты запроса и ответа
        this._prepare();

        let verifyCsrfMiddleware = require('../app/middleware/middlewares/verify');

        // проверяем токен
        if(verifyCsrfMiddleware.handle(this._request, this._response)) {
            uri = uri.replace(/^\/+|\/+$/g, '');

            uri = uri === '' ? '/' : uri;

            // проверяем, есть ли у данного uri паттерн для динамической обработки запросов
            let pattern = this.uriGetPattern(uri, method);

            let callback = this._routes[method.toLowerCase()]._patterns[pattern];;

            if(pattern && callback !== undefined && typeof callback === "function") {
                // если у маршрута есть миддлвары - вызываем их
                if(this.hasMiddlewares(pattern, method)) {
                    return this.bindMiddlewares(uri, method, callback, pattern).handle();
                } else {
                    this._request.params = this.getParams(pattern, uri);
                    return callback(this._request, this._response, ...Object.values(this._request.params));
                }
            }

            callback = this._routes[method.toLowerCase()][uri];

            if(callback !== undefined && typeof callback === 'function') {
                // если у маршрута есть миддлвары - вызываем их
                if(this.hasMiddlewares(uri, method)) {
                    return this.bindMiddlewares(uri, method, callback).handle();
                } else {
                    this._request.params = this.getParams(pattern, uri);
                    return callback(this._request, this._response, ...Object.values(this._request.params));
                }
            } else {
                return this._response.end(this._response.send405());
            }
        } else {
            this._response.writeHead(503, {'Content-Type': 'text/plain; charset=UTF-8'});

            return this._response.end('Неверный токен');
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
    getParams(route, uri) {
        let params = {};

        if(route && typeof route === 'string' && uri && typeof uri === 'string') {
            let keys = this.getParamsKeys(route);
            let values = this.getParamsValues(route, uri);

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
    getParamsKeys(route){
        if(route && typeof route === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');
            route = route === '' ? '/' : route;

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
    getParamsValues(route, uri) {
        if(route && typeof route === 'string' && uri && typeof uri === 'string') {
            route = route.replace(/^\/+|\/+$/g, '');
            route = route === '' ? '/' : route;
            uri = uri.replace(/^\/+|\/+$/g, '');
            uri = uri === '' ? '/' : uri;
            let where = this._where[route];
            let pattern;

            if(where && Object.keys(where).length > 0) {
                Object.keys(where).forEach(param => {
                    let wherePattern = where[param];

                    let regexp = new RegExp(`\{\[${param}\]+\}`);

                    if(route.match(regexp)) {
                        route = route
                            .replace(regexp, `(${wherePattern})`)
                    }
                });
                // экранируем косые черты
                route = route.replace(/\/+/g, '\\/');
                // если еще остались фигурные скобки
                // меняем их на паттерн по умолчанию
                if(route.search(/\{[^\{\}]+\}/g)) {
                    route = route
                        .replace(/\{[^\{\}]+\}/g, '([^\/]+)');
                }
                pattern = route;
            } else {
                // заменяем фигурные скобки на квадратные
                // для регулярного выражения
                // экранируем косые черты
                pattern = route
                    .replace(/\{[^\{\}]+\}/g, '([^\/]+)')
                    .replace(/\/+/g, '\\/');
            }

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
                return this.getParamsValues(pattern, uri).length > 0
            });
        }

        return false;
    }

    /**
     * Применить к маршруту с динамическими параметрами
     * условие в виде регулярного выражения
     * @param condition
     * @return {Router}
     */
    where(condition) {
        if(Object.keys(condition).length > 0) {
            this._where[this._route] = {};

            Object.keys(condition).forEach(param => {
                this._where[this._route][param] = condition[param];
            });
        }

        return this;
    }

    /**
     * Регистрирует маршрут по имени
     * @param name
     * @return {Router}
     */
    name(name) {
        if(Object.keys(this._names).includes(name)) {
            throw new Error(`Имя маршрута "${name}" уже объявлено. Выберите другое имя.`);
        }

        this._names[name] = this._route;

        return this;
    }

    /**
     * Конвертирует алиас в url-адрес, к которому алиас привязан
     * @param name
     * @param data
     */
    convertRouteToUri(name, data = {}) {
        if(!Object.keys(this._names).includes(name)) {
            throw new Error(`Имя маршрута "${name}" не объявлено.`);
        }

        let uri = this._names[name];
        let isPattern = Router.routeIsPattern(uri);

        if(isPattern) {
            let length = uri.match(/\{([^\{|\}]+)\}/g).length;
            uri = uri.replace(/\{([^\{|\}]+)\}/g, '%s');
            let valuesLength = Object.values(data).length;

            if(valuesLength === 0) {
                uri = this._names[name];
                let plural = Pluraliser.pluralize(length, ['параметр', 'параметра', 'праметров']);

                throw new Error(`Для маршрута "${uri}" необходимо передать ${length} ${plural}`);
            } else if (length !== valuesLength) {
                uri = this._names[name];
                let plural = Pluraliser.pluralize(length, ['параметр', 'параметра', 'праметров']);
                let valuesPlural = Pluraliser.pluralize(valuesLength, ['параметр', 'параметра', 'праметров']);

                throw new Error(`Для маршрута "${uri}" ожидалось ${length} ${plural}, получено ${valuesLength} ${valuesPlural}`);
            }

            Object.values(data).forEach(value => uri = uri.replace(/\%s/, value));

            return uri === '/' ? uri : `/${uri}`;
        } else {
            return uri === '/' ? uri : `/${uri}`;
        }
    }
    /**
     * Подготовить заголовок к типу передаваемого контента
     *
     * @param path
     */
    prepareHeader(path){
        if(path.search(/\.jpg$/) !== -1 || path.search(/\.jpeg$/) !== -1) {
            this._response.writeHead(200, {'Content-Type': 'image/jpeg'});
        } else if(path.search(/\.png$/) !== -1) {
            this._response.writeHead(200, {'Content-Type': 'image/png'});
        } else if (path.search(/\.css$/) !== -1) {
            this._response.writeHead(200, {'Content-Type': 'text/css'});
        } else if (path.search(/\.js$/) !== -1) {
            this._response.writeHead(200, {'Content-Type': 'text/js'});
        } else if (path.search(/\.ico$/) !== -1) {
            this._response.writeHead(200, {'Content-Type': 'image/x-icon'});
        } else {
            this._response.writeHead(200, {'Content-Type': 'text/plain'});
        }
    }

    middleware(name) {
        /**
         * @var {Kernel} kernel
         */
        let kernel = require('../app/middleware/kernel');
        /**
         * @var {Array} middlewares
         */
        let middlewares = kernel.getMiddlewares();

        if(Array.isArray(name)) {
            name.forEach(name => {
                if(!Object.keys(middlewares).includes(name)) {
                    throw new Error(`Посредник ${name} не объявлен.`);
                }
            })
        } else if(!Object.keys(middlewares).includes(name)) {
            throw new Error(`Посредник ${name} не объявлен.`);
        }

        if(!this._middlewares[this._route]) {
            this._middlewares[this._route] = {};
        }

        if(!this._middlewares[this._route][this._method]) {
            this._middlewares[this._route][this._method] = [];
        }

        if(Array.isArray(name)) {
            name.forEach(name => {
                this._middlewares[this._route][this._method].push(middlewares[name]);
            });
        } else {
            this._middlewares[this._route][this._method].push(middlewares[name]);
        }

        return this;
    }

    /**
     * Связывает цепочки middleware'ов между собой так
     * что бы каждый middleware имел доступ к middleware, идущим следом
     * в виде функции next внтри метода handle
     * @param uri
     * @param method
     * @param callback
     * @param pattern
     * @return {never|T|*}
     */
    bindMiddlewares(uri, method, callback, pattern = ''){
        let middlewares, layer;
        /**
         * @var {number} index
         */
        let index = 0;

        // если передан паттерн - получаем его мидлвары
        if(pattern) {
            /**
             * @var {Array} middlewares
             */
            middlewares = this._middlewares[pattern][method];
        } else { // если ссылка - получаем ее миддлвары
            /**
             * @var {Array} middlewares
             */
            middlewares = this._middlewares[uri][method];
        }
        /**
         * Получаем первый мидлвар
         * @type {never|T|*}
         */
        let middleware = middlewares[index];
        index = ++index;
        // проверяем, есть ли у маршрута следующий посредник
        if(this.hasNext(pattern ? pattern : uri, method, index)) {
            // если да - получаем следующего посредника
            // следующий посредник будет пытаться найти посредник, идущий следом
            // если найдет - привяжет его к своему handle методу
            // если нет - привяжет функцию callback, которая вызовется в самом конце
            let next = this.getNext({
                uri,
                method,
                index,
                callback,
                pattern
            });

            if(pattern) {
                if(!this._request.params) {
                    this._request.params = this.getParams(pattern, uri);
                }
                // привязываем следующий посредник к первому, пробрасываем параметры
                layer = rebindMiddleware(middleware, this._request, this._response, next.handle, ...Object.values(this._request.params));
            } else {
                // привязываем следующий посредник к первому
                layer = rebindMiddleware(middleware, this._request, this._response, next.handle)
            }
        } else { // если следующиего посредника нет - привязываем callback
            let next;
            // если передан паттерн - получаем параметры из него
            if(pattern) {
                if(!this._request.params) {
                    this._request.params = this.getParams(pattern, uri);
                }
                next = callback.bind(null, this._request, this._response, ...Object.values(this._request.params));
                // привязываем callback к посреднику
                layer = rebindMiddleware(middleware, this._request, this._response, next, ...Object.values(this._request.params));
            } else { // если строка - просто привязываем объект запроса и ответа к callback'у
                next = callback.bind(null, this._request, this._response);
                // привязываем callback к посреднику
                layer = rebindMiddleware(middleware, this._request, this._response, next);
            }
        }

        return layer;
    }

    /**
     * Проверяет, есть ли у текущего маршрута мидлвары
     * @param uri
     * @param method
     * @return {boolean}
     */
    hasMiddlewares(uri, method) {
        let middlewares = this._middlewares[uri][method];

        return !!(middlewares && middlewares.length);
    }

    /**
     * Проверяет, есть ли у маршрута следующий посредник по индексу
     * @param uri
     * @param method
     * @param index
     * @return {boolean}
     */
    hasNext(uri, method, index){
        let middlewares = this._middlewares[uri][method];

        if(index !== undefined) {
            return !!middlewares.slice(index, index+1)[0];
        }

        return false;
    }

    /**
     * Рекурсивная функция
     * Возвращает по индексу следующий посредник
     * Если у след. мидлавара есть посредник, идущий следом - привязывает его handle метод к handle методу след. посредника
     * И т.д.
     * Если у след. посредника отсутствует посредник, идущий следом - привязывает callback к его handle методу
     * @param uri
     * @param method
     * @param index
     * @param callback
     * @param pattern
     * @return {never|T|*}
     */
    getNext({uri, method, index, callback, pattern = ''}) {
        let middlewares, layer;
        // если передан паттерн - получаем его мидлвары
        if(pattern) {
            /**
             * @var {Array} $middlewares
             */
            middlewares = this._middlewares[pattern][method];
        } else {
            /**
             * @var {Array} $middlewares
             */
            middlewares = this._middlewares[uri][method];
        }

        if(index !== undefined) {
            let nextMiddleware = middlewares.slice(index, index+1)[0];

            index = ++index;
            // если у посредника есть следующий посредник - привязываем его handle метод к handle методу посредника
            if(nextMiddleware && this.hasNext(pattern ? pattern : uri, method, index)) {
                let next = this.getNext({uri, method, index, callback, pattern});

                if(pattern) {
                    if(!this._request.params) {
                        this._request.params = this.getParams(pattern, uri);
                    }
                    // привязываем следующий посредник к первому, пробрасываем параметры
                    layer = rebindMiddleware(nextMiddleware, this._request, this._response, next.handle, ...Object.values(this._request.params));
                } else {
                    // привязываем следующий посредник к первому
                    layer = rebindMiddleware(nextMiddleware, this._request, this._response, next.handle)
                }
            // Если след. посредника нет - привязываем callback к его handle методу
            } else if (nextMiddleware && !this.hasNext(pattern ? pattern : uri, method, index)) {
                let next;
                // если передан паттерн - получаем параметры из него
                if(pattern) {
                    if(!this._request.params) {
                        this._request.params = this.getParams(pattern, uri);
                    }
                    next = callback.bind(null, this._request, this._response, ...Object.values(this._request.params));
                    // привязываем callback к посреднику, пробрасываем параметры
                    layer = rebindMiddleware(nextMiddleware, this._request, this._response, next, ...Object.values(this._request.params));
                } else { // если строка - просто привязываем объект запроса и ответа к callback'у
                    next = callback.bind(null, this._request, this._response);

                    layer = rebindMiddleware(nextMiddleware, this._request, this._response, next);
                }
            }

            return layer;
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