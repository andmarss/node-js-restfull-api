/**
 * Основной файл API
 **/

// Зависимости
/**
 * @type {module:http}
 */
const http = require('http');
/**
 * @type {module:url}
 */
const url = require('url');
const StringDescoder = require('string_decoder').StringDecoder;
/**
 * @var {Router} router
 */
const router = require('./router/index');
/**
 * @type {{checks: number, port: number, envName: string, https: number, twilio: {from: string, accountSid: string, token: string}, hash: string}}
 */
const config = require('./config');

// сервер будет отвечать на все запросы строкой
// инициализируем сервер, и слушаем порт из конфига
http.createServer((req, res) => {
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
    let decoder = new StringDescoder('utf-8');
    let buffer = '';

    req
        .on('data', data => buffer += decoder.write(data))
        .on('end', () => {
            buffer += decoder.end();
            // обрабатываем запрос
            router
                .setRequest(req)
                .setResponse(res)
                .direct(uri, method);
        });

}).listen(config.port, () => console.log(`Сервер слушает порт ${config.port}`));
// регистрируем маршруты
require('./routes');