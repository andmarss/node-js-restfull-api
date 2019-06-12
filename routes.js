/**
 * @var {Router} router
 */
const router = require('./router/index');

router.get('/sample', (req, res) => {
    return res.json({'name': 'sample-handler'});
});

router.post('/foo/bar', () => {
    return 'fooooo';
});