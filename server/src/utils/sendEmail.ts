import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, text: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'vwoolynkc36qfnyk@ethereal.email',
            pass: 'uDPUv2EFBGdDaUbmyD',
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fake reddit 👻" <noreply@fakereddit.com>', // sender address
        to: to,
        subject: 'Change password',
        html: text,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
