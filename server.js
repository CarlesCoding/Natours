// Server.js Will now be the entry point for the app
import './env.js';
import mongoose from 'mongoose';
import { app } from './app.js';
// import { connectDb } from './db.js';

const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URL;
const opts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, // Recommended by cli (look up later!)
};

// Start the server
async function startApp() {
    try {
        app.listen(PORT, () => {
            console.log(`✔️  App running on port ${PORT}...`);
        });
    } catch (error) {
        console.error(error);
    }
}

// Connect to Db THEN start app if Successful
mongoose.connect(DB, opts).then(
    () => {
        console.log('✔️  Connected to DB Successfully.');
        startApp();
    },
    (err) => {
        console.error('connection error:', err);

        // if there is a problem close connection to db
        mongoose.disconnect();
    }
);
