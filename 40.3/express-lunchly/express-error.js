/**
|--------------------------------------------------
express error extends the normal js error so we can easily add a status when we make an instance of it
the error-handling middleware will return this
|--------------------------------------------------
*/

class ExpressError extends Error {
    constructor(msg, status) {
        super();
        this.msg = msg;
        this.status = status;
        console.error(this.stack);
    }
}

module.exports = ExpressError;