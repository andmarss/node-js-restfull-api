const User = require('../../models/user');

class UsersController {
    all(request, response){
        User.all().then(users => {
            response.view('index', {users});
        }).catch(err => response.end(err.toString()));
    }

    find(request, response, id) {
        User.find(id)
            .then(user => {
                response.end(response.json(user.data()));
            })
            .catch(err => response.end(err.toString()));
    }

    edit(request, response, id) {

    }

    profile(request, response, id) {
        User.find(id).then(user => {
            response.view('profile/index', {user});
        })
    }
}

module.exports = UsersController;