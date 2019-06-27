// зависимости
/**
 * @type {module:fs}
 */
const fs = require('fs');
/**
 * @type {module:path}
 */
const path = require('path');
/**
 * @type {module:http}
 */
const http = require('http');
/**
 * @type {module:https}
 */
const https = require('https');
/**
 * @type {module:url}
 */
const url = require('url');
/**
 * @type {Session} Session
 */
const Session = require('../app/session/index');

const Cookie = require('../app/cookie');

const Auth = require('../app/auth');

const { asset } = require('../helpers/index');

let auth;

const StringDecoder = require('string_decoder').StringDecoder;
/**
 * @var {Router} router
 */
const router = require('../router/index');
/**
 * @type {{checks: number, port: number, envName: string, https: number, twilio: {from: string, accountSid: string, token: string}, hash: string}}
 */
const config = require('../config');

let instance = null;

/**
 * @class Server
 *
 * @method init
 */
class Server {
    constructor(){
        this._options = {
            keys: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
        };
    }

    /**
     * Обработчик запросов
     * @param req
     * @param res
     */
    _start(req, res){
        /**
         * получаем url и парсим его
         * @type {Url}
         */
        let parsed = url.parse(req.url, true);
        /**
         * получаем путь
         * @var {string} path
         */
        let pathname = parsed.pathname;
        let uri = pathname.replace(/^\/+|\/+$/g, '');
        uri = uri === '' ? '/' : uri;
        /**
         * Получаем http метод
         * @var {string} method
         */
        let method = req.method.toLowerCase();
        // получить http заголовки, как объект
        let headers = req.headers;
        // получаем строку запроса как объект
        let query = parsed.query;
        // получаем данные, если есть
        let decoder = new StringDecoder('utf-8');
        let buffer = '';

        if(Server._isRequestToAssets(uri)) {
            Server._loadAssets(req, res);
        } else {
            // запускаем сессию
            Session.start(req, res).then(session => {
                if(session && !req.session) {
                    req.session = session;
                }

                if(!req.cookie) {
                    req.cookie = Cookie.getInstance(req, res);
                }

                // инициализируем аутентификацию
                if(!auth) {
                    auth = Auth.getInstance(req.session, req.cookie);
                }

                req
                    .on('data', data => buffer += decoder.write(data))
                    .on('end', () => {
                        buffer += decoder.end();
                        // обрабатываем запрос
                        router
                            .setRequest(req)
                            .setResponse(res)
                            .setBuffer(buffer)
                            .direct(uri, method);
                    });
                // когда выполняется ответ на запрос - обновляем сессию
                // подгружая все изменения
                res.on('finish', () => {
                    req.session.update().then(session => {
                        req.session = session;
                    })
                });
            }).catch(err => res.end(err.toString()));
        }
    }

    /**
     * Запрос на статичные файлы? (css, js, картинки)
     * @param uri
     * @return {boolean}
     * @private
     */
    static _isRequestToAssets(uri) {
        /**
         * @var {string} publicPath
         */
        let publicPath = uri.replace(/\/?public/, '');

        return uri !== '/' && fs.existsSync(path.join(__dirname, `../public/${publicPath}`));
    }

    /**
     * Загрузить статичные файлы
     * @param request
     * @param response
     * @private
     */
    static _loadAssets(request, response) {
        /**
         * @type {string}
         */
        let pathname = url.parse(request.url, true).pathname;
        /**
         * @type {string}
         */
        let uri = pathname.replace(/^\/+|\/+$/g, '');
        /**
         * @type {string}
         */
        let publicPath = uri.replace(/\/?public/, '');

        router
            .setRequest(request)
            .setResponse(response)
            .prepareHeader(publicPath);

        asset(publicPath).then(data => {
            response.end(data);
        }).catch(err => response.end(err.toString()));
    }

    /**
     * инициализирует http и https сервера
     */
    init(){
        http.createServer(this._start.bind(this)).listen(config.port, () => console.log(`Сервер слушает порт ${config.port}`));
        https.createServer(this._options, this._start.bind(this)).listen(config.https, () => console.log(`Сервер слушает порт ${config.https}`));
    }

    static getInstance(){
        if(!instance) {
            instance = new Server();
        }

        return instance;
    }
}

module.exports = Server.getInstance();