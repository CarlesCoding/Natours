// ---------- Server.js Will now be the entry point for the app ---------- //
import './env.js';
import mongoose from 'mongoose';
import { app } from './app.js';

// Catch uncaught exceptions rejections
process.on('uncaughtException', (err) => {
    console.log('UNHANDLED EXCEPTION! 💢 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URL;
const opts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, // Recommended by cli (look up later!)
};

// Connect to Database
mongoose
    .connect(DB, opts)
    .then(() => console.log('✔️  Connected to DB Successfully.'));

// Start Application
const server = app.listen(PORT, () => {
    console.log(`✔️  App running on port ${PORT}...`);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💢 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
