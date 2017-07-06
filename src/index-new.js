const geolib = require('geolib');
const moment = require('moment');
const _ = require('lodash');
const co = require('co');

const fetcher = require('./fetcher')
const buildUrl = require('./url-builder');
const sendEmail = require('./dispatcher');
const parseAd = require('./ad-parser');
const adsRepository = require('./ads-repository');

const query = require('../config/query');


function processAds() {
    const summary = {};
    
    let currentPage = 1;
    const processPage = co(function* (pageNumber) {
        const page = yield fetcher.fetchPage({page: currentPage});
        
    });
}