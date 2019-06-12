/**
 * @var {Router} router
 */
const router = require('./router/index');

router.get('/sample', () => {
    return 'sample';
});

router.post('/foo/bar', () => {
    return 'fooooo';
});