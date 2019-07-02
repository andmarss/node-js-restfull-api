const Middleware = require('./middleware');

class Test1 extends Middleware {
    handle(request, response, next) {
        console.log(2);
        next();
    }
}

module.exports = new Test1();