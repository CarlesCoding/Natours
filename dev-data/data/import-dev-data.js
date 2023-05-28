import '../../env.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tour from '../../models/tourModel.js';
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
    fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8')
);
console.log(tours);
// Import data in to database
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log(`${tours.length} tours successfully added!`);
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data from database
const deleteData = async () => {
    try {
        await Tour.deleteMany(); // Deletes everything in that collection in the DB
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
