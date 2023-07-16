/* eslint-disable class-methods-use-this */
import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// TEST MAILBOX: https://mailtrap.io/inboxes

class Email {
    constructor(user, url) {
        this.to = user.email;
        // eslint-disable-next-line prefer-destructuring
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Beefy Muffins <${process.env.EMAIL_FROM}>`;
    }

    // METHODS
    newTransport() {
        // Production use REAL emails
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'Sendgrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }
        // Development use FAKE emails (mailtrap)
        return nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAILER_USERNAME,
                pass: process.env.MAILER_PASSWORD,
            },
        });
    }

    // Send the actual email
    async send(template, subject) {
        // 1.) Render HTML based on a pug template
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                // Options passed into the template to be used.
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );

        // 2.) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html), // text version on the email, is good to send for success rates and to help with spam.
        };

        // 3.) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for 10 minutes)'
        );
    }
}

export default Email;
