import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
// ESM Specific quirks (features)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* app.js mostly used for middleware decelerations. Server.js will be the entry point

const app = express();

// Tell express to use pug & where the views are
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ------------------ GLOBAL MIDDLEWARE ------------------ //

// Serve static files from a folder, NOT from a route. In this case static files comes from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// LOGGER: only ran in the development environment (good for debugging)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// IP RATE LIMITER: Allowed: 100 request from per 1 hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: `To many request from this IP, please try again in an hour!`,
});

// use the limiter on ALL routes that start with /api
app.use('/api', limiter);

// Body parser, reading data from the body into req.body (json)
app.use(express.json({ limit: '10kb' }));

// DATA SANITIZATION against NoSQL query injection
app.use(mongoSanitize());

// DATA SANITIZATION against XSS (cross-site-scripting)
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
    hpp({
        whitelist: [
            'duration',
            'maxGroupSize',
            'difficulty',
            'ratingsAverage',
            'ratingsQuantity',
            'price',
        ],
    })
);

// TEST MIDDLEWARE: Create own middleware: Adds the time of request to the request call
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// ------------------ ROUTES (These routes are technically middleware) ------------------ //

// The different 'Routers', is essentially creating a small application for each route, then mount the router to the route.
app.use('/', viewRouter); // Mounting the router
app.use('/api/v1/tours', tourRouter); // Mounting the router
app.use('/api/v1/users', userRouter); // Mounting the router
app.use('/api/v1/reviews', reviewRouter); // Mounting the router

// Middleware added after the routes, in case the request isn't handled in the above routes.
// It catches all http request types with '.all()' and any route with '*'
// if ANYTHING is passed into next(), its assumed its an error.
// & skips all other middleware & send the error to the global error handling middleware
app.all('*', (req, res, next) => {
    next(new AppError(`Cant't find ${req.originalUrl} on this serer!`, 404));
});

// Global Error Handling middleware
app.use(globalErrorHandler);

export { app };
