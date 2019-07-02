class Kernel {
    constructor() {
        this.middlewares = {
            auth: require('./middlewares/auth'),
            guest: require('./middlewares/guest')
        };
    }

    getMiddlewares() {
        return this.middlewares;
    }
}

module.exports = new Kernel();