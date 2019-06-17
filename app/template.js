const fs = require('fs');

const path = require('path');

const cache = {};

class Template {
    /**
     * @param filepath
     * @param data
     * @return {Promise<any>|*}
     * @api public
     */
    static render(filepath, data = {}) {
        filepath = Template._makePath(filepath);

        let keys = Object.keys(data);

        ({...keys} = data);

        return new Promise((resolve, reject) => {

            fs.readFile(filepath, 'utf-8', (err, fileData) => {
                if(err) {
                    reject(err);
                    return;
                }

                if(fileData.search(/<%\s*extend/) === 0) {
                    let parentFilePath = /<%\s*extend(.*?)\s*%>/.exec(fileData)[1].trim().replace(/\"|\'/g, '');

                    parentFilePath = Template._makePath(parentFilePath);

                    fs.readFile(parentFilePath, 'utf-8', (err, parentFileData) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        let compiled = Template._compileTemplate(parentFileData, fileData);

                        let fn = Template._createFunction(compiled);

                        resolve(fn(data));
                    })
                } else {
                    let fn = Template._createFunction(fileData);

                    resolve(fn(data));
                }
            });
        });
    }

    /**
     * @param filepath
     * @return {string}
     * @api private
     */
    static _makePath(filepath) {
        if(filepath && filepath.length) {
            filepath = filepath.indexOf('.html') > 0 ? filepath : `${filepath}.html`;
            return path.join(__dirname, `../views/${filepath}`);
        }

        return path.join(__dirname, '../views/');
    }

    static _createFunction(string) {
        return new Function('obj',
            `let p = [], print = () => p.push.apply(p, arguments);
                    with(obj){p.push('${string.replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")}');
                    }; return p.join('');`);
    }

    static _compileTemplate(template, depend) {
        // сменяем yield 'name_of_block' на block_name_of_block
        template = template.replace(/<%\s*yield\s*[\"|\'](.*?)[\'|\"]\s*%>/g, 'block_$1');
        // получаем имена этих блоков
        let blocks = template
            .match(/block_[a-z0-9]+/g);
        // сменяем block 'name_of_block' на block_name_of_block
        // убираем endblock
        // убираем extend
        let compiledDepend = depend.replace(/<%\s*block\s*[\"|\'](.*?)[\"|\']\s*%>/g, 'block_$1');
        compiledDepend = compiledDepend.replace(/<%\s*endblock\s*%>/g, '');
        compiledDepend = compiledDepend.replace(/<%\s*extend(.*?)\s*%>/, '');
        compiledDepend = compiledDepend.trim();

        blocks.forEach((name, index) => {
            // следующий блок
            let next = blocks[index+1];
            // индекс следующего блока
            let i = compiledDepend.trim().indexOf(name);
            let chunk = '';
            // если следующий блок есть
            // обрезаем контент до него, и убираем лишние оступы
            if(next) {
                let nextIndex = compiledDepend.indexOf(next);
                // обрезаем контент до след. блока
                chunk = compiledDepend.trim().slice(i+name.length, nextIndex);
            } else {
                // обрезаем контент до конца
                chunk = compiledDepend.trim().slice(i+name.length);
            }
            // меняем block_name_block на вырезанный кусок
            template = template.replace(name, chunk);
        });

        return template;
    }
}

module.exports = Template;