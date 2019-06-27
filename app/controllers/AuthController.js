const Hash = require('../hash');
const Auth = require('../auth');

class AuthController {
    loginIndex(request, response) {

    }

    registerIndex(request, response) {

    }

    login(request, response) {
        let auth = Auth.getInstance();

        response.json(auth.login(request.data));
    }

    register(request, response) {
        let auth = Auth.getInstance();

        auth.register(request.data).then(user => {
            response.end(response.json(user.data()));
        });
    }
}

module.exports = AuthController;