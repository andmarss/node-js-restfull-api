class Kernel {
    constructor() {
        this.middlewares = {
            auth: require('./middlewares/auth'),
            guest: require('./middlewares/guest'),
            'profile.check': require('./middlewares/checkProfile')
        };
    }

    getMiddlewares() {
        return this.middlewares;
    }
}

module.exports = new Kernel();