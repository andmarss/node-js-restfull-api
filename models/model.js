const fs = require('fs');
const path = require('path');

/**
 * @class Model
 *
 * @method delete
 * @method path
 * @method data
 */

class Model {
    constructor(instance = {}) {

        if(Object.keys(instance).length > 0) {
            this._data = instance;
        } else {
            this._data = {};
        }

        this._fillable = Model._fillable;
        this._path = Model._path;
        this._name = Model._name;
    }
    /**
     * @var {number} id
     */
    delete(id = null) {
        if(!id) throw new Error('Необходимо передать идентификатор, по которому будет производится поиск.');

        if(!this._name) throw new Error('Необходимо указать имя файла');

        let name = this._name.trim().match(/\.json$/g) ? this._name : `${this._name}.json`;

        return new Promise((res, rej) => {
            fs.readFile(`${this._path}/${name}`, {encoding: 'utf-8', flag: 'a+'}, (err, data) => {
                if(err) rej(err);

                data = data ? JSON.parse(data) : '';

                if(!data || !data.length) {
                    rej(new Error('Список экземпляров пуст'));
                }

                let indexToDelete = data.findIndex(instance => parseInt(instance.id) === parseInt(id));

                if(indexToDelete !== -1) rej(new Error(`Объект с идентификатором ${id} не найден`));
                /**
                 * Данные уже без удаленного экземпляра
                 * @type {string}
                 */
                let insertingData = JSON.stringify([].concat(...data.slice(0, indexToDelete), ...data.slice(indexToDelete+1)));

                // открываем файл для чтения и записи
                fs.open(`${this._path}/${name}`, 'r', (err, desc) => {
                    if(!err && desc) {
                        fs.writeFile(desc, insertingData, err => {
                            if(err) rej(err);

                            fs.close(desc, err => {
                                if(err) rej(err);

                                res(true);
                            });
                        })
                    } else {
                        rej(err);
                    }
                });
            });
        });
    }

    path(){
        let name = this._name.trim().match(/\.json$/g) ? this._name : `${this._name}.json`;

        return `${this._path}/${name}`;
    }

    data(){
        return this._data;
    }
}

Model._fillable = [];
Model._path = path.join(__dirname, '../.data/');
Model._name = '';

module.exports = Model;