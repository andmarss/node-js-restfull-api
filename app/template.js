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
        filepath = Template._getPath(filepath);

        let keys = Object.keys(data);

        ({...keys} = data);

        return new Promise((resolve, reject) => {

            fs.readFile(filepath, 'utf-8', (err, fileData) => {
                if(err) {
                    reject(err);
                    return;
                }

                if(fileData.search(/<%\s*extend/) === 0) {
                    let parentFilePath = /<%\s*extend\s*[\"|\'](.*?)[\"|\']\s*%>/.exec(fileData)[1].trim();

                    parentFilePath = Template._getPath(parentFilePath);

                    fs.readFile(parentFilePath, 'utf-8', (err, parentFileData) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        Template._compileTemplate(parentFileData, fileData)
                            .then(compiled => {
                                let fn = Template._createFunction(compiled);

                                resolve(fn(data));
                            })
                            .catch(err => reject(err));
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
    static _getPath(filepath) {
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
        compiledDepend = compiledDepend.replace(/<%\s*extend(.*?)\s*%>/, '');
        compiledDepend = compiledDepend.trim();

        let endBlocks = compiledDepend.match(/<%\s*endblock\s*%>/g);
        // если количество закрывающих конструкций для блоков не равно количеству открывающих
        // выбрасываем ошибку
        // закрывающие конструкции можно опустить, но сделать это придется для всех блоков
        if(endBlocks && endBlocks.length > 0 && endBlocks.length !== blocks.length) {
            throw new Error(`Количество открывающих и закрывающих конструкций для блоков должно быть одинаково.`);
        }

        blocks.forEach((name, index) => {
            // следующий блок
            let next = blocks[index+1];
            // закрывающая конструкция
            let endOfBlock = endBlocks && endBlocks.length > 0 ? endBlocks[index] : '';
            // индекс следующего блока
            let i = compiledDepend.trim().indexOf(name);
            let chunk = '';

            if(endOfBlock) {
                let endBlockIndex = compiledDepend.indexOf(endOfBlock);
                // обрезаем контент до конца блока
                chunk = compiledDepend.trim().slice(i+name.length, endBlockIndex);
                // убираем первую закрывающую конструкцию
                compiledDepend = compiledDepend.replace(/<%\s*endblock\s*%>/, '');
            } else {
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
            }
            // меняем block_name_block на вырезанный кусок
            template = template.replace(name, chunk);
        });

        return new Promise((resolve, reject) => {

            if(template.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g)) {
                template = Template._parseIncludes(template);

                resolve(template);
            } else {
                resolve(template);
            }

        });
    }

    /**
     * Получает все вложения, и возвращает массив значений всех вложений
     * @param template
     * @return {string}
     * @private
     */
    static _parseIncludes(template){
        let includes = template.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g);

        includes.forEach(include => {
            include = include.replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '$1');
            let includePath = Template._getPath(include);

            let includeData = fs.readFileSync(includePath, 'utf-8');

            let regexp = new RegExp(`<%\\s*include\\s*[\\"|\\']${include}[\\"|\\']\\s*%>`);

            // у вложений не должно быть конструкций include, extend, block и пр.
            // поэтому убираем их
            includeData = includeData
                .replace(/<%\s*yield\s*[\"|\'](.*?)[\'|\"]\s*%>/g, '')
                .replace(/<%\s*block\s*[\"|\'](.*?)[\"|\']\s*%>/g, '')
                .replace(/<%\s*endblock\s*%>/g, '')
                .replace(/<%\s*extend(.*?)\s*%>/, '')
                .replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '');

            template = template.replace(regexp, includeData);
        });

        return template;
    }
}

module.exports = Template;