const CsrfMiddleware = require('./csrf');

class VerifyCsrfMiddleware extends CsrfMiddleware {
    constructor(){
        super();

        this.verify = [];
    }
}

module.exports = new VerifyCsrfMiddleware();