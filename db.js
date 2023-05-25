import mongoose from 'mongoose';

const DB = process.env.MONGO_URL;
const opts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true, // Recommended by cli (!look up later)
};

export async function connectDb() {
    try {
        // Connect to database
        mongoose.connect(DB, opts).then(() => {
            console.log('✔️  Connected to DB Successfully.');
        });
    } catch (e) {
        console.error('connection error:', e);

        // if there is a problem close connection to db
        await mongoose.disconnect();
    }
}
