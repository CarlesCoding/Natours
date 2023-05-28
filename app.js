import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
// ESM Specific quirks (features)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* app.js mostly used for middleware decelerations. Server.js will be our entry point

const app = express();

// --------- MIDDLEWARE ---------
// Only run logger in development environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // good for logging/debugging
}

app.use(express.json()); // allows the ability to parse json from request
app.use(express.static(`${__dirname}/public`)); // Serve static files from a folder, NOT from a route

// Create own middleware
app.use((req, res, next) => {
    console.log('Hello from the middleware! 👋');
    next();
});

// Another created middleware: Adds the time of request to the request call
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// --------- ROUTES (These routes are technically middleware)---------
// (tourRouter & userRouter) is essentially creating a small application for each router, then mount the router to the route.
app.use('/api/v1/tours', tourRouter); // Mounting the router
app.use('/api/v1/users', userRouter); // Mounting the router

export { app };
