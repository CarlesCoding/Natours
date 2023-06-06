import nodemailer from 'nodemailer';

// TEST MAILBOX: https://mailtrap.io/inboxes

const sendEmail = async (options) => {
    // const testAccount = await nodemailer.createTestAccount();

    // 1.) Create the transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        // secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILER_USERNAME,
            pass: process.env.MAILER_PASSWORD,
        },
    });

    // 2.) Define the email options
    const mailOptions = {
        from: 'Beefy <beefy@beefy.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };

    // 3.) Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
