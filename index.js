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
    // отправляем ответ
    res.end('Hello World\n');
    // выводим путь запроса
    console.log('Запрос принят по маршруту:', trimmed);

}).listen(3000, () => console.log('Сервер слушает порт 3000'));