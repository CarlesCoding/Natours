import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxLength: [
                40,
                'A Tour must have less or equal then 40 characters',
            ],
            minLength: [
                10,
                'A Tour must have more or equal then 10 characters',
            ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A Tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A Tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A Tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            // CUSTOM VALIDATOR
            validate: {
                // value: priceDiscount
                validator(value) {
                    // this only points to current doc on NEW document creation
                    return value < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below the regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A Tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A Tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false, // hide when getTour() is called
        },
        startDates: [Date],
        secretTour: Boolean,
        default: false,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Can NOT use virtual properties in query
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs ONLY before .save() and .create(). Has access to 'next()'
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }); // lowercase
    next();
});

// 'post' middleware executes after pre middleware is completed
// tourSchema.post('save', (doc, next) => {
//     console.log(`doc = `, doc);
//     next();
// });

// QUERY MIDDLEWARE
// all strings that start with 'find'
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
    // 'this' is a query object here.
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    // 'this' is a aggregation object here.
    // add '$match' to the beginning of the pipeline array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // filter out the secretTour
    console.log(this.pipeline());
    next();
});

// .model(nameOfModel, Schema)
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
