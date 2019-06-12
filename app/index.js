/**
 * @var {Server} server
 */
const server = require('../server/index');
let instance = null;

/**
 * @class App
 *
 * @method init
 */
class App {
    init() {
        server.init();

        require('../routes');
    }

    static getInstance(){
        if(!instance) instance = new App();

        return instance;
    }
}

module.exports = App.getInstance();