const Auth = require('../../auth');
const Middleware = require('./middleware');

class GuestMiddleware extends Middleware {
    handle(request, response, next){
        let auth = Auth.getInstance();

        if(auth.check()) {
            response.redirect().back();
        } else {
            next();
        }
    }
}

module.exports = new GuestMiddleware();