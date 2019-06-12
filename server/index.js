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
        let path = parsed.pathname;
        let uri = path.replace(/^\/+|\/+$/g, '');
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