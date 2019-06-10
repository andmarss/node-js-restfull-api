/**
 * Основной файл API
 **/

// Зависимости
const http = require('http');

// сервер будет отвечать на все запросы строкой
// инициализируем сервер, и слушаем порт 3000
http.createServer((req, res) => {
    res.end('Hello World\n');
}).listen(3000, () => console.log('Сервер слушает порт 3000'));