/**
 * @var {Router} router
 */
const router = require('./router/index');
/**
 * @var {User} user
 */
const User = require('./models/user');

router.get('/sample', (req, res) => {
    res.end(res.json({'name': 'sample-handler'}));
});

router.post('/foo/bar', (req, res) => {
    res.end('fooooo');
});

router.get('/ping', (req, res) => {
    res.end(res.json({}));
});

router.post('/user/create', (req, res) => {
    User.create(req.data)
        .then(user => {
            res.end(res.json(user.data()));
        })
        .catch(err => {
            res.end(err.toString());
        });
});

router.get('/user/find/{id}', 'UsersController@find');

router.get('/users/all', 'UsersController@all');