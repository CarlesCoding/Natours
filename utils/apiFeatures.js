class APIFeatures {
    // Constructor gets called immediately
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // -------------------- Methods -------------------- //
    filter() {
        // 1A.) FILTERING
        const queryObj = { ...this.queryString }; // Take a hard copy of the obj
        const excludedFields = ['page', 'sort', 'limit', 'fields']; // Remove these fields from query, well handle these elsewhere
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B.) ADVANCED FILTERING
        //* NOTE: When doing advanced filtering in a real app, you would want to document it. So, others know how it works and what they can do with it

        let queryString = JSON.stringify(queryObj);

        // mongo stores variable with '$' . so we use regex and loop through the string and add $ where need be. THEN, search the db
        queryString = queryString.replace(
            /\b(gte|gt|lye|lt)\b/g,
            (match) => `$${match}`
        );

        // Create the query here (not called yet), allows to modify the query with sorting, filtering, ect..
        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' '); // tours?sort=-price,ratingsAverage: remove ',' fro url and join on space
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // default sort if not supplied
        }

        return this;
    }

    limitFields() {
        // 3.) FIELD LIMITING
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // - :exclude the '__v' field
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        // tours?page=2&limit=10. 1-10: page 1, 11-20: page2, ect.
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export default APIFeatures;
