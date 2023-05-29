// Express knows its a error handling middleware, when these 4 values are supplied
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // default error status Code
    err.status = err.status || 'error'; // default status

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

export default globalErrorHandler;
