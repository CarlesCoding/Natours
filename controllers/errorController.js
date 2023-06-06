import AppError from '../utils/appError.js';

/*
  THREE TYPES OF ERRORS IN MONGO: 
  CastError (invalid ID), validation, Duplication (Tours cant have same name. Must be unique as described in the Tour.model)
*/

// ------- HANDLE ALL MONGOOSE SPECIFIC ERRORS ------- //
// Transfer mongoose error into a operational error we can read. Everything passes to AppError() is transformed into a operational error
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate Field Value: "${value}". Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message); // loop over all the errors and display them all
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// ------- HANDLE ALL JWT SPECIFIC ERRORS ------- //
const handleJWTError = () =>
    new AppError(`Invalid Token. Please login again.`, 401);

const handleJWTExpiredError = () =>
    new AppError(`Your token has expired! Please login again.`, 401);

// ------- PRODUCTION VS DEVELOPMENT ------- //
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProduction = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

// ------- THE MAIN ERROR HANDLER FOR ALL ERRORS ------- //
// Express knows its a error handling middleware, when these 4 values are supplied
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // default error status Code
    err.status = err.status || 'error'; // default status

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }; // hard copy of error
        if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error._message === 'Validation failed')
            error = handleValidationErrorDB(error, res);

        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProduction(error, res);
    }
};

export default globalErrorHandler;
