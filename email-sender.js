const emailConfig = require('./nconf').get('email');
const sendgrid = require('sendgrid')(emailConfig.apiKey);

module.exports = (options, callback) => {
  const model = {
    from: 'ads@apartment-finder.com',
    fromname: 'Apartment Finder',
    replyto: emailConfig.from,
    to: emailConfig.to,
    subject : options.subject,
    html: options.body
  };

  sendgrid.send(model, callback);
};