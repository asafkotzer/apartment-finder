const _ = require('lodash');
const fetch = require('node-fetch');
const uuid = require('node-uuid');
const geolib = require('geolib');
const sendgrid = require('sendgrid')('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');

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

const searchArea = [
  {latitude: 32.078284, longitude: 34.801168},
  {latitude: 32.079157, longitude: 34.815073},
  {latitude: 32.068174, longitude: 34.814472},
  {latitude: 32.066501, longitude: 34.808636},
  {latitude: 32.063810, longitude: 34.796877},
  {latitude: 32.068538, longitude: 34.795761},
  {latitude: 32.071593, longitude: 34.797049},
  {latitude: 32.070865, longitude: 34.799881},
  {latitude: 32.076684, longitude: 34.802198},
]

const query = {
  FromPrice: 1500000,
  ToPrice: 2500000,
  AreaID:'48.0',
  FromRooms:3.5,
  ToRooms:4.5,
  FromSQM:80,
  ToSQM:120
}

const url = buildUrl(query);

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
    address: 'המעיין',
    rooms: 4,
    price: 2150000,
    picture: 'http://images.yad2.co.il/Pic/201507/08/2_5/o/e_soft_2_5_2_38950_20150708190749.jpg',
    location: {
      latitude: 32.072175,
      longitude: 34.808873
    },
    originalAdUrl: 'http://m.yad2.co.il/Nadlan/TivSalesAd.php?NadlanID=1370970&utm_source=AndroidApp&utm_medium=link&utm_campaign=Androidapp-AdPage&AppType=Android&mapAddress=adrs%3D%D7%92%D7%91%D7%A2%D7%AA%D7%99%D7%99%D7%9D%26lat%3D32.072175%26lng%3D34.808873'
  }
];

queryResult
  .filter(x => geolib.isPointInside(x.location, searchArea))
  .forEach(x => sendEmail({ 
    to: 'asafkotzer@gmail.com',
    subject: 'New apartment',
    body: '<h1>New!</h1>'
  }, (result) => console.log(result)));

console.log("waiting 10 seconds");
setTimeout(function() { }, 10000);