class Middleware {
    constructor() {
        this.__handler = this.handle;
    }

    handle(request, response, next) {
        // TODO
    }
}

module.exports = Middleware;