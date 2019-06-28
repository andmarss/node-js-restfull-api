let instance = null;
let User = require('../../models/user');
let config = require('../../config');

class Auth {
    constructor(session, cookie){
        this.session = session;
        this.cookie = cookie;
        this.sessionName = config.session.sessionName;
        this.sessionInstance = config.session.sessionInstance;
        this.cookieName = config.remember.cookieName;
    }

    /**
     * Проверяет, если пользователь по переданным свойствам есть - авторизирует его
     * Иначе возвращает false
     * @param data
     * @return {*}
     */
    attempt(data) {
        return new Promise((resolve, reject) => {
            this.login(data).then(user => {
                resolve(user ? user : false);
            }).catch(err => reject(err))
        });
    }

    /**
     * Метод для авторизации пользователя
     * @param data
     * @return {boolean|Promise<*>}
     */
    login(data) {
        return new Promise((resolve, reject) => {
            User.where(user => user.email === data.email)
                .then(user => {
                    if(user && user.validPassword(data.password)) {
                        this.session.set(this.sessionName, user.id);
                        this.session.set(this.sessionInstance, user);

                        resolve(user);
                    } else {
                        resolve(false);
                    }
                }).catch(err => reject(err));
        });
    }

    /**
     * Метод для регистрации пользователя
     * @param data
     * @return {boolean|Promise<*>}
     */
    register(data) {
        return new Promise((resolve, reject) => {
            User.where(user => user.email === data.email).then(user => {
                if(user) {
                    reject('Пользователь с таким Email\'ом уже зарегестрирован');
                    return;
                }

                User.create(data).then(user => {
                    if(user) {
                        this.login(data).then(authenticated => {
                            resolve(authenticated);
                        })
                    }
                })
            });
        });
    }

    /**
     * Авторизирован ли пользователь
     * @return {boolean}
     */
    check() {
        return this.session.get(this.sessionName) !== undefined;
    }

    /**
     * Возвращает true, если пользователь - не авторизирован
     * @return {boolean}
     */
    guest() {
        return this.session.get(this.sessionName) === undefined;
    }

    /**
     * Возвращает id авторизированного пользователя
     * @return {null}
     */
    id() {
        return this.check() ? this.session.get(this.sessionName) : null;
    }

    /**
     * Если пользователь авторизирован - возвращает его объект
     * Иначе - возвращает null
     * @return {Promise<any>}
     */
    user() {
        return this.check() ? this.session.get(this.sessionInstance) : null;
    }
    /**
     * @return bool
     *
     * Очищает информацию аутентификации пользователя в сессии пользователя
     */
    logout() {
        if(this.session.has(this.sessionName)) {
            this.session.delete(this.sessionName);
            this.session.delete(this.sessionInstance);
        }

        if(this.cookie.has(this.cookieName)) {
            this.cookie.delete(this.cookieName);
        }

        return true;
    }

    static getInstance(session, cookie) {
        if(!instance) {
            instance = new Auth(session, cookie);
        }

        return instance;
    }
}

module.exports = Auth;