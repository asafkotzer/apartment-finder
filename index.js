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

  return base + _.toPairs(Object.assign(options, queryDefaults)).map(x => x.join('=')).join('&');
}

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

// 2. Filter for area
// inside:
console.log(geolib.isPointInside(
  {latitude: 32.074647, longitude: 34.807799},
  [
    {latitude: 32.075593, longitude: 34.806705},
    {latitude: 32.075629, longitude: 34.809151},
    {latitude: 32.073993, longitude: 34.809172},
    {latitude: 32.073975, longitude: 34.806747}
  ]));

// outside:
console.log(geolib.isPointInside(
  {latitude: 32.072811, longitude: 34.806511},
  [
    {latitude: 32.075593, longitude: 34.806705},
    {latitude: 32.075629, longitude: 34.809151},
    {latitude: 32.073993, longitude: 34.809172},
    {latitude: 32.073975, longitude: 34.806747}
  ]));

// 3. Send email
const sendEmail = (options, callback) => {
  const model = {
    from: 'asafkotzer@gmail.com',
    to: options.to,
    subject : options.subject,
    html: options.body
  };

  sendgrid.send(model, callback);
};

// Email will include the following fields
// adType
// city
// address
// rooms
// price
// pictures
// location.coordinates.latitude
// location.coordinates.longitude
// originalAdUrl

sendEmail({to: 'asafkotzer@gmail.com', subject: 'New apartment', body: '<h1>New!</h1>'}, (result) => console.log(result))

console.log("waiting 10 seconds");
setTimeout(function() { }, 10000);