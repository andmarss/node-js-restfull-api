/**
 * Основной файл API
 **/

// Зависимости
const http = require('http');
const url = require('url');

// сервер будет отвечать на все запросы строкой
// инициализируем сервер, и слушаем порт 3000
http.createServer((req, res) => {
    /**
     * получаем url и парсим его
     * @type {Url}
     */
    let parsed = url.parse(req.url, true);
    // получаем путь
    /**
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
    // отправляем ответ
    res.end('Hello World\n');
    // выводим путь запроса
    console.log('Запрос принят по маршруту:', trimmed, 'метод запроса:', method, 'параметры строки запроса', query, 'заголовки', headers);

}).listen(3000, () => console.log('Сервер слушает порт 3000'));