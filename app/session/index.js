const path = require('path');
const fs = require('fs');
const url = require('url');
const Cookie = require('../cookie/index');
const Token = require('../token');
let cookieInstance;

const SESSION_PATH = path.join(__dirname, '../../.sessions/');

let instance = null;

class Session extends Map {
    constructor(session){
        super();

        Object.keys(session).forEach(key => {
            super.set(key, session[key]);
        });
    }

    /**
     * Инициализирует сессию для клиента
     * @param request
     * @param response
     * @param options
     * @return {Promise<any>}
     */
    static start(request, response, options = {}) {
        cookieInstance = Cookie.getInstance(request, response);
        let cookie = cookieInstance.parseCookie();
        let keys = Object.keys(cookie);
        // по умолчанию
        let expires = options.expires || 0;
        // если в заголовках есть id сессии - работаем с ним
        if(keys.length > 0 && keys.includes('SESSID')) {
            let sessionId = cookie['SESSID'];
            // если старый файл сессии существует
            // работаем с ним
            if(fs.existsSync(`${SESSION_PATH}${sessionId}.json`)) {
                return new Promise((resolve, reject) => {
                    fs.readFile(`${SESSION_PATH}${sessionId}.json`, 'utf-8' ,(err, fileData) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        let data = fileData ? JSON.parse(fileData) : {};
                        // если файл пустой - удаляем его
                        if(data.__id === undefined || data.__expires === undefined) {
                            Session.delete(sessionId);

                            resolve(Session.start(request, response));
                        } else if (data.__expires !== 0 && data.__expires < Date.now()) { // если сессия устарела - удаляем её
                            Session.delete(sessionId);

                            Session.start(request, response).then(session => resolve(session));
                        } else {
                            instance = new Session(data);

                            resolve(instance);
                        }
                    })
                });
            } else { // если файла нет - создаем новый
                return new Promise((resolve, reject) => {
                    // генерируем идентификатор новой сессии
                    sessionId = Session.generateSessionId();

                    fs.readFile(`${SESSION_PATH}${sessionId}.json`, {encoding: 'utf-8', flag: 'w+'}, (err, fileData) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        fileData = {};
                        fileData.__id = sessionId;
                        // если ранее была установлена дата - обновляем её, если нет - то оставляем 0
                        fileData.__expires = expires !== 0 && expires ? new Date(Date.now()+expires) : 0;
                        let insertingData = JSON.stringify(fileData);

                        fs.open(`${SESSION_PATH}${sessionId}.json`, 'w+', (err, desc) => {
                            if(err) {
                                reject(err);
                                return;
                            }

                            fs.writeFile(desc, insertingData, err => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                // закрываем файл, передаем в реультатирующую функцию экземпляр сессии
                                fs.close(desc, err => {
                                    if(err) {
                                        reject(err);
                                        return;
                                    }

                                    instance = new Session(fileData);

                                    cookieInstance
                                        .set('SESSID', sessionId, 'Session')
                                        .send();

                                    resolve(instance);
                                });
                            });
                        })
                    });
                });
            }
        } else { // если заголовка нет - генерируем новую сесиию
            return new Promise((resolve, reject) => {
                // генерируем идентификатор новой сессии
                let sessionId = Session.generateSessionId();

                fs.readFile(`${SESSION_PATH}${sessionId}.json`, {encoding: 'utf-8', flag: 'w+'}, (err, fileData) => {
                    if(err) {
                        reject(err);
                        return;
                    }

                    fileData = {};
                    fileData.__id = sessionId;
                    // если ранее была установлена дата - обновляем её, если нет - то оставляем 0
                    fileData.__expires = expires !== 0 && expires ? new Date(Date.now()+expires) : 0;
                    let insertingData = JSON.stringify(fileData);

                    fs.open(`${SESSION_PATH}${sessionId}.json`, 'w+', (err, desc) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        fs.writeFile(desc, insertingData, err => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            // закрываем файл, передаем в реультатирующую функцию экземпляр сессии
                            fs.close(desc, err => {
                                if(err) {
                                    reject(err);
                                    return;
                                }

                                instance = new Session(fileData);

                                cookieInstance
                                    .set('SESSID', sessionId, 'Session')
                                    .send();

                                resolve(instance);
                            });
                        });
                    })
                });
            });
        }
    }

    /**
     * Удаляет сессию по её идентификатору
     * @param sessionId
     * @return {any}
     */
    static delete(sessionId) {
        if(sessionId) {
            return new Promise((resolve) => {
                fs.unlink(`${SESSION_PATH}${sessionId}.json`, err => {
                    resolve(!err);
                });
            });
        }
    }

    /**
     * Генериреует идентификатор сессии длиной length символов
     * @param length
     * @return {string|string|boolean}
     */
    static generateSessionId( length = 32 ) {
        if(length && typeof length === 'number') {
            let possibleCharacters = 'abcdefghijlmnopqrstuvwxyzABCDEFGHIJLMNOPQRSTUVWXYZ0123456789';
            let str = '';
            let random;

            for(let i = 0; i < length; i++) {
                random = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

                str += random;
            }

            return str;
        }

        return false;
    }

    get(name){
        return super.get(name);
    }

    set(name, value) {
        super.set(name, value);
    }

    /**
     * Обновляет данные сессии
     * @return {Promise<any>}
     */
    update() {
        let keys = Array.from(super.entries()).filter(entry => {
            return entry[0] !== '__id' && entry[0] !== '__expires';
        }).map(entry => entry[0]);

        let includesData = {};

        keys.forEach(key => {
            includesData[key] = super.get(key);
        });

        return new Promise((resolve, reject) => {
            fs.readFile(`${SESSION_PATH}${super.get('__id')}.json`, 'utf-8', (err, fileData) => {
                if(err) {
                    reject(err);
                    return;
                }

                fileData = typeof fileData === 'string' && fileData ? JSON.parse(fileData) : {};
                // если ранее была установлена дата - обновляем её, если нет - то оставляем 0
                let expires = fileData.__expires !== 0 && fileData.__expires ? (new Date(Date.now() + 1000*60*60*24*7)).toUTCString() : 0;

                fileData = Object.assign(includesData, {__id: fileData.__id, __expires: expires});

                fs.open(`${SESSION_PATH}${super.get('__id')}.json`, 'w+', (err, desc) => {
                    if(err) {
                        reject(err);
                        return;
                    }

                    fs.writeFile(desc, JSON.stringify(fileData), err => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        fs.close(desc, err => {
                            if(err) {
                                reject(err);
                                return;
                            }

                            instance = new Session(fileData);

                            cookieInstance
                                .set('SESSID', fileData.__id, 'Session')
                                .send();

                            resolve(instance);
                        })
                    })
                })
            });
        });
    }

    token() {
        return Token;
    }

    static getInstance() {
        if(!instance) {
            instance = new Session({});
        }

        return instance;
    }
}

module.exports = Session;