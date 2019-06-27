const path = require('path');
const fs = require('fs');

const Token = require('../app/token');

let instance = null;

class Helpers {
    static publicPath(publicPath) {
        return path.join(__dirname, `../public/${publicPath}`)
    }

    /**
     * Подгрузить статичные файлы (js, css, картинки)
     * @param path
     * @return {Promise<any>}
     */
    asset(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(Helpers.publicPath(path), (err, data) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });
    }

    /**
     * Генерирует csrf-токен
     * @return {*}
     */
    csrf_token() {
        return Token.generate();
    }

    /**
     * Вовзаращает скрытое поле, которое можно добавить на форму запроса
     * @return {string}
     */
    csrf_field() {
        return `<input type="hidden" name="token" value="${this.csrf_token()}" />`;
    }

    static getInstance(){
        if(!instance) {
            instance = new Helpers();
        }

        return instance;
    }
}

module.exports = Helpers.getInstance();