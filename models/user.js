const Model = require('./model');
const fs = require('fs');

/**
 * @class User
 *
 * @method save
 * @method delete
 * @method find
 * @method create
 * @method data
 * @method path
 */

class User extends Model {
    constructor(instance = {}){
        super(instance);

        this._fillable = User._fillable;

        this._name = User._name;
    }

    static all(){
        if(!User._name) throw new Error('Необходимо указать имя файла');

        let name = User._name.trim().match(/\.json$/g) ? User._name : `${User._name}.json`;

        return new Promise((res, rej) => {
            fs.readFile(`${User._path}/${name}`, {encoding: 'utf-8', flag: 'a+'}, (err, data) => {
                if(err) rej(err);

                data = data ? JSON.parse(data) : '';

                if(!data || !data.length) {
                    rej('Список пользователей пуст');
                    return;
                }

                let users = data.map(user => new User(user));

                res(users);
            });
        });
    }

    static find(id = null){
        if(!id) throw new Error('Необходимо передать идентификатор, по которому будет производится поиск.');

        if(!User._name) throw new Error('Необходимо указать имя файла');

        let name = User._name.trim().match(/\.json$/g) ? User._name : `${User._name}.json`;

        return new Promise((res, rej) => {
            fs.readFile(`${User._path}/${name}`, {encoding: 'utf-8', flag: 'a+'}, (err, data) => {
                if(err) rej(err);

                data = data ? JSON.parse(data) : '';

                if(!data || !data.length) {
                    rej('Список экземпляров пуст');
                    return;
                }

                let resolve = data.find(instance => parseInt(instance.id) === parseInt(id));

                if(!resolve) {
                    rej(`Пользователь с идентификатором ${id} не найден`);
                    return;
                }

                res(new User(resolve));
            });
        });
    }

    static create(data = {}){
        if(!User._name) throw new Error('Необходимо указать имя файла, к которому относится модель');

        if(User._fillable.length === 0) throw new Error('Необходимо указать допустимые для заполнения поля');

        if(Object.keys(data).length > User._fillable.length) throw new Error(`Переданный объект содержит слишком много полей для заполнения.
        Допустимыми для заполнения полями являются: "${User._fillable.join(', ')}"`);

        if(Object.keys(data).length < User._fillable.length) throw new Error(`Переданный объект содержит слишком мало полей для заполнения.
        Обязательные поля для заполнения: "${User._fillable.join(', ')}"`);

        if(Object.keys(data).length > 0) {

            Object.keys(data).forEach(key => {
                if(!User._fillable.includes(key)) {
                    throw new Error(`Ключ ${key} не является допустимым для записи`);
                }
            });

            let name = User._name.trim().match(/\.json$/g) ? User._name : `${User._name}.json`;

            let insertingData;

            return new Promise((res, rej) => {
                // открываем файл модели, если файла нет - он будет создан
                fs.readFile(`${User._path}/${name}`, {encoding: 'utf-8', flag: 'a+'}, (err, fileData) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    // парсим данные, прочитанные из файла
                    fileData = fileData ? JSON.parse(fileData) : '';
                    // если файл пустой, или его нет - создаем его
                    if(!fileData || !fileData.length) {
                        // открываем файл - если он отсутствует - создаем его
                        fs.open(`${User._path}/${name}`, 'a+', (err, desc) => {
                            if(!err && desc) {
                                // данные, которые будут заносится в файл
                                insertingData = JSON.stringify([{...data, id: 1}]);
                                // пишем в файл данные
                                fs.writeFile(desc, insertingData, err => {
                                    if (err) {
                                        rej(err);
                                        return;
                                    }
                                    // закрываем файл, передаем в реультатирующую функцию наши данные
                                    fs.close(desc, err => {
                                        if(err) {
                                            rej(err);
                                            return;
                                        }

                                        res(JSON.parse(insertingData));
                                    });
                                })
                            } else {
                                rej(err);
                                return;
                            }
                        })
                    } else {
                        // находим последний добавленный идентификатор
                        let lastId = Math.max.apply(Math, fileData.map(instance => { return instance.id; }));

                        if(lastId) {
                            // добавляемый экземпляр
                            let instance = {...data, id: ++lastId};

                            let sameEmail = fileData.find(user => user.email === instance.email);

                            if(sameEmail) {
                                rej(new Error('Пользователь с данным email\'ом уже зарегестрирован. Измените email адрес на другой.'));
                                return;
                            }

                            insertingData = JSON.stringify([...fileData, instance]);

                            // открываем файл для чтения и записи
                            fs.open(`${User._path}/${name}`, 'w+', (err, desc) => {
                                if(!err && desc) {
                                    fs.writeFile(desc, insertingData, err => {
                                        if(err) {
                                            rej(err);
                                            return;
                                        }

                                        fs.close(desc, err => {
                                            if(err) {
                                                rej(err);
                                                return;
                                            }

                                            res(new User(instance));
                                        });
                                    })
                                } else {
                                    rej(err);
                                    return;
                                }
                            });
                        } else {
                            rej('Не найден последний идентификатор');
                            return;
                        }
                    }
                });
            })
        } else {
            throw new Error(`Для создания экземпляра нужно передать объект с обязательными параметрами "${User._fillable.join(', ')}"`);
        }
    }

    get id() {
        return this._data['id'];
    }

    get name() {
        return this._data['name'];
    }

    get email() {
        return this._data['email'];
    }

    get password() {
        return this._data['password'];
    }

    set name(value) {
        this._data['name'] = value;
    }

    set email(value) {
        this._data['email'] = value;
    }

    set password(value) {
        this._data['password'] = value;
    }

    /**
     * @return {string|Promise<any>}
     */
    save(){
        if(Object.keys(this._data).length === 0) return 'Данные не заполнены';

        let savingData = Object.keys(this._data).filter(key => {
            return this._fillable.includes(key);
        }).reduce((savingObj, key) => {
            savingObj[key] = this._data[key];

            return savingObj;
        }, {});

        return new Promise((resolve, reject) => {
            fs.readFile(this.path(), {encoding: 'utf-8', flag: 'a+'}, (err, fileData) => {
                if(err) {
                    reject(err);
                    return;
                }
                // парсим данные, прочитанные из файла
                fileData = fileData ? JSON.parse(fileData) : '';
                // если файл пустой - пользователей нет, сохранять нечего
                if(!fileData || !fileData.length) {
                    reject(new Error(`Список пользователей пуст`));
                    return;
                }
                // ищем пользователя
                let savingUser = fileData.find(user => parseInt(user.id) === parseInt(this._data.id));

                if(!savingUser) {
                    reject(new Error(`Пользовтель не найден`));
                    return;
                }

                let sameEmail = fileData.find(user => user.email === this.data().email);

                if(sameEmail) {
                    reject(new Error('Пользователь с данным email\'ом уже зарегестрирован. Измените email адрес на другой.'));
                    return;
                }

                // смешиваем старые и новые данные
                savingUser = {...savingUser, ...savingData};

                fileData = JSON.stringify([...fileData.filter(user => parseInt(savingUser.id) !== parseInt(user.id)), savingUser]);

                fs.open(this.path(), 'w+', (err, desc) => {
                    if(err) reject(err);

                    if(!desc) {
                        reject(new Error('Файл не найден'));
                        return;
                    }

                    // пишем обновленные данные в файл
                    fs.writeFile(this.path(), fileData, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        // закрываем файл, передаем результат об успешно проделанной работе
                        // или об ошибке, если она возникла
                        fs.close(desc, err => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(true);
                        });
                    });
                });
            });
        });
    }
}

User._name = 'users';
User._fillable = ['name', 'email', 'password'];

module.exports = User;