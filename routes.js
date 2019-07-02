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
}).middleware('auth').name('index');

router.get('/user/find/{id}', 'UsersController@find');

router.get('/users/all', 'UsersController@all');

router.get('/register', 'AuthController@registerIndex').name('register-index').middleware('guest');

router.get('/login', 'AuthController@loginIndex').name('login-index').middleware('guest');

router.post('/register', 'AuthController@register').name('register').middleware('guest');

router.post('/login', 'AuthController@login').name('login').middleware('guest');