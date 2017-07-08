const _ = require('lodash');
const os = require('os');
const showdown  = require('showdown');

function renderTitle(ad) {
    return `דירת ${ad.rooms} חדרים, בשכונת ${ad.extraData['שכונה']} ברחוב ${ad.extraData['רחוב']}. מחיר: ${ad.price} ש״ח`;
}

function renderMap(ad) {
    const image = `![](https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyAwUfJNBM7Uy7doaECdYJ813nlhRs17IT4=&zoom=15&size=400x300&markers=${ad.coordinates.latitude},${ad.coordinates.longitude})`

    return `[${image}](http://maps.google.com/?q=${ad.coordinates.latitude},${ad.coordinates.longitude})`;
}

function renderImages(ad) {
    const imageText = _.chain(ad.images)
        .map(imageUrl => `![](${imageUrl})`)
        .join(os.EOL)
        .value();

    return `[${imageText}](${ad.url})`
}

function renderBody(ad) {
    return `#### דירת ${ad.rooms} חדרים מ${ad.merchant ? 'תיווך' : 'פרטי'} בשכונת ${ad.extraData['שכונה']} ברחוב ${ad.extraData['רחוב']} . מחיר: ${ad.price} ש״ח

${renderMap(ad)}

${renderImages(ad)}
`;
}

function render(ad, renderType = 'markdown') {
    const markdown = {
        title: renderTitle(ad),
        body: renderBody(ad)
    }

    switch(renderType) {
        case 'html': {
            const converter = new showdown.Converter();
            return _.mapValues(markdown, md => converter.makeHtml(md));
        }
        default:
        case 'markdown':
            return markdown;
    }
}

module.exports = render;