const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const AppError = require('./appError');

module.exports = class Email {
  from = process.env.EMAIL_FROM;
  constructor(user, url, order = null) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.order = order;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_SERVER,
        port: process.env.BREVO_PORT,
        secure: false,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_SMTP_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async _send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      order: this.order,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    try {
      const info = await this.newTransport().sendMail(mailOptions);
    } catch (err) {
      throw new AppError('Something went worng!', 400);
    }
  }

  async sendWelcome() {
    await this._send('welcome', 'Welcome to the Cartify Family!');
  }

  async sendPasswordReset() {
    await this._send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)',
    );
  }

  async sendOrderConfirm() {
    await this._send(
      'orderConfirmation',
      'Your order has been placed successfuly!',
    );
  }
};
