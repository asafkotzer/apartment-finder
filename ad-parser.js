

const moment = require('moment');

const log = message => console.log('[' + moment().format('HH:mm') + '] ' + message);

module.exports = rawJson => {
  //log('raw jason: ' + rawJson.Line6)
  return {
    id: rawJson.RecordID,
    source: rawJson.source,
    city: rawJson.Line1.split('-')[0].trim(),
    address: (rawJson.Line1.split('-')[1] || '').trim().replace('\"', '').replace('\'', ''),
    roomCount: (rawJson.Line2.split('-')[1] || '').trim().replace('\"', '').replace('\'', ''), 
	aparttype: (rawJson.Line2.split('-')[0] || '').trim().replace('\"', '').replace('\'', ''),
    price: (rawJson.Line3.match(/\d+/g) || []).join(''),
    publishDate: moment(rawJson.Line4, 'DD-MM-YYYY'),
    picture: rawJson.img.replace('/s/','/o/').replace('-mobile-s',''),
    location: {
      latitude: rawJson.latitude,
      longitude: rawJson.longitude,
    },
    originalAdUrl: rawJson.URL.slice(0, rawJson.URL.indexOf("&utm"))
}};