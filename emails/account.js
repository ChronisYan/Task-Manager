require("dotenv").config();
const constants = require("../utils/constants");

const mailgun = require("mailgun-js")({
  apiKey: process.env.MAIL_API_KEY,
  domain: process.env.MAIL_DOMAIN,
  host: "api.eu.mailgun.net",
});

const sendWelcomeEmail = (email, first_name) => {
  const data = {
    from: constants.EMAIL_SENDER,
    to: email,
    subject: `${first_name}, welcome onboard!`,
    text: "Testing some Mailgun awesomeness!",
  };

  mailgun.messages().send(data, (error, body) => {});
};
