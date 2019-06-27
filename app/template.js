const fs = require('fs');

const path = require('path');
const Auth = require('./auth');

class Template {
    /**
     * @param filepath
     * @param data
     * @return {Promise<any>|*}
     * @api public
     */
    static render(filepath, data = {}) {
        filepath = Template._getPath(filepath);

        data.asset = path => {
            return `/public/${path}`
        };

        data.auth = Auth.getInstance();
        /**
         * @var {Router} router
         */
        const router = require('../router/index');

        data.route = (name, data) => router.convertRouteToUri(name, data);

        return new Promise((resolve, reject) => {

            fs.readFile(filepath, 'utf-8', (err, fileData) => {
                if(err) {
                    reject(err);
                    return;
                }
                // если файл наследуется
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
                } else { // если файл не наследуется, то у него не должно быть конструкций extend, block и т.д.
                    fileData = fileData.replace(/<%\s*yield\s*[\"|\'](.*?)[\'|\"]\s*%>/g, '')
                        .replace(/<%\s*block\s*[\"|\'](.*?)[\"|\']\s*%>/g, '')
                        .replace(/<%\s*endblock\s*%>/g, '')
                        .replace(/<%\s*extend(.*?)\s*%>/, '');
                    // если есть включаемые вложения
                    // включаем их
                    if(fileData.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g)) {
                        Template._parseIncludes(fileData).then(chunks => {
                            // получаем список вложений
                            let includes = fileData.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g);

                            includes.forEach((include, index) => {
                                // наименование вложения, заключенное в ковычках
                                include = include.replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '$1');
                                let chunk = chunks[index];
                                let regexp = new RegExp(`<%\\s*include\\s*[\\"|\\']${include}[\\"|\\']\\s*%>`);
                                // заменяем вложение на значение файла
                                fileData = fileData.replace(regexp, chunk);
                            });

                            let fn = Template._createFunction(fileData);

                            resolve(fn(data));
                        });
                    } else {
                        let fn = Template._createFunction(fileData);

                        resolve(fn(data));
                    }
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
        try {
            return new Function('obj',
                `let p = [], print = () => p.push.apply(p, arguments);
                    with(obj){p.push('${string.replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .replace(/\<\s*script[^\>]*\>[\r\t\n\s]+([^\<]+)\<\/\s*script\s*\>/g, match => {
                        return match.match(/([\"|\'])/g) ? match.replace(/([\"|\'])/g, m => {
                            return '\\' + m;
                        }) : match
                    })
                    .replace(/\<\s*style[^\>]*\>[\r\t\n\s]+([^\<]+)<\/\s*style\s*\>/g, match => {
                        return match.match(/([\"|\'])/g) ? match.replace(/([\"|\'])/g, m => {
                            return '\\' + m;
                        }) : match
                    })
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")}');
                    }; return p.join('');`);
        } catch (e) {
            console.error(e);
        }
    }

    static _compileTemplate(template, depend) {
        // сменяем yield 'name_of_block' на block_name_of_block
        template = template.replace(/<%\s*yield\s*[\"|\'](.*?)[\'|\"]\s*%>/g, 'block_$1');
        // сменяем block 'name_of_block' на block_name_of_block
        // убираем endblock
        // убираем extend
        let compiledDepend = depend.replace(/<%\s*block\s*[\"|\'](.*?)[\"|\']\s*%>/g, 'block_$1');
        compiledDepend = compiledDepend.replace(/<%\s*extend(.*?)\s*%>/, '');
        compiledDepend = compiledDepend.trim();
        // получаем имена этих блоков
        let blocks = compiledDepend
            .match(/block_[a-z0-9]+/ig);

        let endBlocks = compiledDepend.match(/<%\s*endblock\s*%>/g);
        // если количество закрывающих конструкций для блоков не равно количеству открывающих
        // выбрасываем ошибку
        // закрывающие конструкции можно опустить, но сделать это придется для всех блоков
        if(endBlocks && endBlocks.length > 0 && endBlocks.length < blocks.length) {
            throw new Error(`Количество открывающих и закрывающих конструкций для блоков должно быть одинаково.`);
        } else if (endBlocks && endBlocks.length > 0 && endBlocks.length > blocks.length) { // дублирующиеся блоки
            throw new Error(`Дублирование блоков недоступно.`);
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
                // парсим вложения, получаем массив значений этих файлов
                Template._parseIncludes(template).then(chunks => {
                    // получаем список вложений
                    let includes = template.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g);

                    includes.forEach((include, index) => {
                        // наименование вложения, заключенное в ковычках
                        include = include.replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '$1');
                        let chunk = chunks[index];
                        let regexp = new RegExp(`<%\\s*include\\s*[\\"|\\']${include}[\\"|\\']\\s*%>`);
                        // заменяем вложение на значение файла
                        template = template.replace(regexp, chunk);
                    });

                    // убираем имена блоков, которые не подставляются
                    resolve(template.replace(/block_[a-z0-9]+/ig, ''));

                }).catch(err => reject(err));
            } else {
                // убираем имена блоков, которые не подставляются
                resolve(template.replace(/block_[a-z0-9]+/ig, ''));
            }

        });
    }

    /**
     * Получает все вложения, и возвращает массив значений всех вложений
     * @param template
     * @return {Promise<any[]>}
     * @private
     */
    static _parseIncludes(template){
        let includes = template.match(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/g);
        let promises = [];

        includes.forEach(include => {
            include = include.replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '$1');
            let includePath = Template._getPath(include);

            promises.push(
                new Promise((resolve, reject) => {
                    fs.readFile(includePath, 'utf-8', (err, includeData) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        // у вложений не должно быть конструкций include, extend, block и пр.
                        // поэтому убираем их
                        includeData = includeData
                            .replace(/<%\s*yield\s*[\"|\'](.*?)[\'|\"]\s*%>/g, '')
                            .replace(/<%\s*block\s*[\"|\'](.*?)[\"|\']\s*%>/g, '')
                            .replace(/<%\s*endblock\s*%>/g, '')
                            .replace(/<%\s*extend(.*?)\s*%>/, '')
                            .replace(/<%\s*include\s*[\"|\'](.*?)[\"|\']\s*%>/, '')
                            .trim();

                        resolve(includeData);
                    });
                })
            );
        });

        return Promise.all(promises);
    }
}

module.exports = Template;