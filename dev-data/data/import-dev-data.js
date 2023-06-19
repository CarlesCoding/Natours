import '../../env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tour from '../../models/tourModel.js';
import User from '../../models/userModel.js';
import Review from '../../models/reviewModel.js';
// ESM Specific quirks (features)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB = process.env.MONGO_URL;
const opts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, // Recommended by cli (look up later!)
};

// Connect to Db
mongoose.connect(DB, opts).then(
    () => {
        console.log('✔️  Connected to DB Successfully.');
    },
    (err) => {
        console.error('connection error:', err);

        // if there is a problem close connection to db
        mongoose.disconnect();
    }
);

// Read JSON from file
const tours = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8')
);

// Import data in to database
// node .\dev-data\data\import-dev-data.js --import
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log(`${tours.length} tours successfully added!`);
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data from database
// node .\dev-data\data\import-dev-data.js --delete
const deleteData = async () => {
    try {
        await Tour.deleteMany(); // Deletes everything in that collection in the DB
        await User.deleteMany();
        await Review.deleteMany();
        console.log(`${tours.length} tours successfully deleted! `);
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Run the cli script
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

/* 
Commands (Run in terminal)
  node dev-data/data/import-dev-data.js --import
  node dev-data/data/import-dev-data.js --delete
*/
