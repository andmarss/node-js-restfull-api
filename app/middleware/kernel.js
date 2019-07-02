class Kernel {
    constructor() {
        this.middlewares = {
            auth: require('./middlewares/auth'),
            guest: require('./middlewares/guest'),
            test: require('./middlewares/test'),
            test1: require('./middlewares/test1')
        };
    }

    getMiddlewares() {
        return this.middlewares;
    }
}

module.exports = new Kernel();