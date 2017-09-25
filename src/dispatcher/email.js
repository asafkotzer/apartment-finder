const emailConfig = require('../nconf').get('dispatcher').email;
const sendgrid = require('sendgrid')(emailConfig.sendgridApiKey);
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

    return new Promise((resolve, reject) => sendgrid.send(message, (error) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    }));
};

function dispatch(ad) {
    const rendered = renderer(ad, 'html');
    return send({
        subject: rendered.title,
        body: rendered.body,
    }).catch(err => console.error(err));
}

module.exports = dispatch;
