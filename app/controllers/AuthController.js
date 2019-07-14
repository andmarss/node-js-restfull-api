const Hash = require('../hash');
const Auth = require('../auth');
const User = require('../../models/user');

class AuthController {
    loginIndex(request, response) {
        response.view('login/index');
    }

    registerIndex(request, response) {
        response.view('register/index');
    }

    login(request, response) {
        let auth = Auth.getInstance();

        auth.login(request.data).then(user => {
            return response.redirect().route('profile', {id: user.id});
        });
    }

    register(request, response) {
        let auth = Auth.getInstance();

        auth.register(request.data).then(user => {
            return response.redirect().route('profile', {id: user.id});
        });
    }

    logout(request, response) {
        let auth = Auth.getInstance();

        if(auth.logout()) {
            return response
                .redirect()
                .route('login-index');
        } else {
            return response.redirect().back();
        }
    }
}

module.exports = AuthController;