const emailConfig = require('./nconf.js').get('email');
const path = require('path')
const sendgrid = require('sendgrid')(emailConfig.sendgridApiKey);
const EmailTemplate = require('email-templates').EmailTemplate
const templateDir = path.join(__dirname, 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)

const Handlebars = require('handlebars');
Handlebars.registerHelper('formatSource', function(source) {
  return source === 'agent' ? 'תיווך' : 'פרטי';
});

const send = (options, callback) => {
  const message = {
    from: 'ads@apartment-finder.com',
    fromname: 'Apartment Finder',
    replyto: emailConfig.from,
    to: emailConfig.to,
    subject : options.subject,
    html: options.body
  };

  sendgrid.send(message, callback);
};

module.exports = model => 
  emailTemplate.render(model)
    .then(results => send({ 
      subject: results.text, 
      body: results.html 
    },
    (err) => {
      if (err) console.log(err);
    }));