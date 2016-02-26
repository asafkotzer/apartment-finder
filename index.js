const _ = require('lodash');
const fetch = require('node-fetch');
const uuid = require('node-uuid');
const geolib = require('geolib');
const sendgrid = require('sendgrid')('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');
const EmailTemplate = require('email-templates').EmailTemplate
const path = require('path')
const query = require('./query.js');

const templateDir = path.join(__dirname, 'new-ad-email')
const emailTemplate = new EmailTemplate(templateDir)

const buildUrl = (options) => {
  const base = "http://m.yad2.co.il/API/MadorResults.php?";
  const defaults = {
    CatID:2,
    SubCatID:2,
    PriceType:'0.0',
    AppType:'Android',
    AppVersion:'2.4',
    DeviceType:'GT-I9300',
    udid:uuid.v1()
  }

  return base + _.toPairs(Object.assign(options, defaults)).map(x => x.join('=')).join('&');
}

const sendEmail = (options, callback) => {
  const model = {
    from: 'asafkotzer@gmail.com',
    to: options.to,
    subject : options.subject,
    html: options.body
  };

  sendgrid.send(model, callback);
};

const url = buildUrl(query.apartment);

// 1. Get apartments
console.log(url)
// fetch(url, { method: 'GET' })
//   .then(response => response.json())
//   .then(json => console.log(json))
//   .catch(err => console.error(err));

// fetching is not working yet, so I'll fake a collection:
const queryResult = [
  { 
    city: 'גבעתיים',
    address: 'המעיין 5',
    roomCount: 4,
    price: 2150000,
    picture: 'http://images.yad2.co.il/Pic/201507/08/2_5/o/e_soft_2_5_2_38950_20150708190749.jpg',
    location: {
      latitude: 32.072175,
      longitude: 34.808873
    },
    originalAdUrl: 'https://m.yad2.co.il/Nadlan/TivSalesAd.php?NadlanID=1370970&utm_source=AndroidApp&utm_medium=link&utm_campaign=Androidapp-AdPage&AppType=Android&mapAddress=adrs%3D%D7%92%D7%91%D7%A2%D7%AA%D7%99%D7%99%D7%9D%26lat%3D32.072175%26lng%3D34.808873'
  }
];

queryResult
  .filter(x => geolib.isPointInside(x.location, query.searchArea))
  .forEach(x => {
    emailTemplate.render(queryResult[0], (err, results) => {
      sendEmail({ 
        to: 'asafkotzer@gmail.com',
        subject: results.text,
        body: results.html
      })
    })
  });

console.log("waiting 10 seconds");
setTimeout(function() { }, 10000);