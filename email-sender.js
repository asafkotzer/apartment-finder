const emailConfig = require('./nconf.js').get('email');
const path = require('path')
const sendgrid = require('sendgrid')(emailConfig.sendgridApiKey);

const EmailTemplate = require('email-templates').EmailTemplate
const templateDir = path.join(__dirname, 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)

const Handlebars = require('handlebars');
Handlebars.registerHelper('formatSource', function (source) {
  return source === 'agent' ? 'תיווך' : 'פרטי';
});

const helper = require('sendgrid').mail;
const fromEmail = new helper.Email('ads@apartment-finder.com', 'Apartment Finder');
const replyToEmail = new helper.Email(emailConfig.from);
const personalization = new helper.Personalization();
emailConfig.to.forEach(toEmail => {console.log(toEmail); personalization.addTo(new helper.Email(toEmail))});


const send = (options, callback) => {
    let mail = new helper.Mail();
    mail.setReplyTo(replyToEmail);
    mail.setFrom(fromEmail);
    mail.setSubject(options.subject);
    mail.addPersonalization(personalization);
    const content = new helper.Content('text/html', `<html>${options.body}</html>`)
    mail.addContent(content);

    var request = sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });
    sendgrid.API(request, callback);
  
};

module.exports = model =>
  emailTemplate.render(model)
    .then(results => send({
      subject: results.text,
      body: results.html
    },
      (err) => {
        if (err) console.log(err.response.body.errors);
      }));