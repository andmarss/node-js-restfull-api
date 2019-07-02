const Auth = require('../../auth');
const Middleware = require('./middleware');

class AuthMiddleware extends Middleware {
    handle(request, response, next){
        let auth = Auth.getInstance();

        if(auth.guest()) {
            response.redirect().route('login-index');
        } else {
            next();
        }
    }
}

module.exports = new AuthMiddleware();