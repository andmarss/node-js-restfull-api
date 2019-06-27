const Hash = require('../hash');
const Auth = require('../auth');
const User = require('../../models/user');

class AuthController {
    loginIndex(request, response) {
        response.view('login/index');
    }

    registerIndex(request, response) {

    }

    login(request, response) {
        let auth = Auth.getInstance();

        User
            .where(user => user.email === request.data.email)
            .then(user => {
                response.end(response.json(user));
            });

        // response.json(auth.login(request.data));
    }

    register(request, response) {
        let auth = Auth.getInstance();

        auth.register(request.data).then(user => {
            response.end(response.json(user.data()));
        });
    }
}

module.exports = AuthController;