const path = require('path');
const fs = require('fs');

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

    static getInstance(){
        if(!instance) {
            instance = new Helpers();
        }

        return instance;
    }
}

module.exports = Helpers.getInstance();