const Auth = require('../../auth');
const Middleware = require('./middleware');

class CheckProfile extends Middleware {
    /**
     * @param request
     * @param response
     * @param next
     * @param id
     * @return {*|void}
     */
    handle(request, response, next, id){
        /**
         * @var {Auth} auth
         */
        let auth = Auth.getInstance();

        if(parseInt(auth.id()) !== parseInt(request.params.id)) {
            return response.redirect().back();
        } else {
            next();
        }
    }
}

module.exports = new CheckProfile();