/**
 * @var {Router} router
 */
const router = require('./router/index');
/**
 * @var {User} user
 */
const User = require('./models/user');

router.get('/', (req, res) => {
    res.view('index');
});

router.get('/user/find/{id}', 'UsersController@find');

router.get('/users/all', 'UsersController@all');

router.get('/register', 'AuthController@registerIndex').name('register-index');

router.get('/login', 'AuthController@loginIndex').name('login-index');

router.post('/register', 'AuthController@register').name('register');