import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name.'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        // This 'validate' only works on CREATE & SAVE!! NOT: findAndUpdate()
        validate: {
            validator(el) {
                return el === this.password;
            },
            message: 'Please make sure the passwords match.',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

// Middleware ran after data is received. BUT, BEFORE submitted to database
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with a cost of 12 (Higher the harder to crack, but means for more CPU intensive. Default is 10.)
    this.password = await bcrypt.hash(this.password, 12);

    // Remove passwordConfirm field. Its only used to make sure they insert the right password on create User.
    this.passwordConfirm = undefined;

    next();
});

// Instance method that can be called to check passwords are correct
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    // Return true OR false if passwords match
    return bcrypt.compare(candidatePassword, userPassword);
};

// Instance method that can be called to check passwords are correct
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, // milliseconds to seconds
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // FALSE means NOT changed
    return false;
};

// Instance method that can be called to create password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Use crypto to encrypt the reset token to save in DB (NEVER save a plain text token)
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // ? Check this is 10min expiration

    // Return the unencrypted token, to be sent in reset email.
    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
