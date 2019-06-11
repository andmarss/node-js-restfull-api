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

// сервер будет отвечать на все запросы строкой
// инициализируем сервер, и слушаем порт 3000
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
    let trimmed = path.replace(/^\/+|\/+$/g, '');
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
            // отправляем ответ
            res.end('Hello World\n');
            // выводим путь запроса, и прочие данные
            console.log(
                'Запрос принят по маршруту:',
                trimmed,
                'метод запроса:',
                method,
                'параметры строки запроса',
                query,
                'заголовки',
                headers,
                'данные',
                buffer
            );
        });

}).listen(3000, () => console.log('Сервер слушает порт 3000'));