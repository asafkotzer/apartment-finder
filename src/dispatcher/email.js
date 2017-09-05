const emailConfig = require('../nconf').get('dispatcher').email;
const sendgrid = require('sendgrid')(emailConfig.sendgridApiKey);
const sendGridSend = promisify(sendgrid.send);
const promisify = require('promisify-node');
const renderer = require('./renderer');

const send = options => {
    const message = {
        from: 'ads@apartment-finder.com',
        fromname: 'Apartment Finder',
        replyto: emailConfig.from,
        to: emailConfig.to,
        subject: options.subject,
        html: options.body,
    };

    return sendgrid.send(message, callback);
};

function dispatch(ad) {
    const rendered = renderer(ad, 'html');
    return send({
        subject: rendered.title,
        body: rendered.body,
    }).catch(err => console.error(err));
}

module.exports = dispatch;
