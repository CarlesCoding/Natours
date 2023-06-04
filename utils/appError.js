class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // sets message property to the incoming message

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // used to test if error is operational (a error we know) in errorController.js

        Error.captureStackTrace(this, this.constructor); // cleans the appError call from the stacktrace
    }
}

export default AppError;
