const Middleware = require('./middleware');

class Test extends Middleware {
    constructor(){
        super();
    }

    handle(request, response, next) {
        console.log(1);
        next();
    }
}

module.exports = new Test();