const moment = require('moment');

const parseIsraelDate = x => moment(x, 'DD/MM/YYYY');

module.exports = {
    areas: [
        {
            labels: ['new apartment', 'מרכז תל אביב'],
            points: [
                {latitude: 32.086111, longitude: 34.769027},
                {latitude: 32.084575, longitude: 34.785463},
                {latitude: 32.073346, longitude: 34.782014},
                {latitude: 32.062221, longitude: 34.773691},
            ],
        },
        {
            labels: ['new apartment', 'דרום תל אביב'],
            points: [
                {latitude: 32.0671196, longitude: 34.7626948},
                {latitude: 32.0533444, longitude: 34.7541547},
                {latitude: 32.0486248, longitude: 34.7636712},
                {latitude: 32.0546902, longitude: 34.7650981},
                {latitude: 32.0547447, longitude: 34.7721148},
                {latitude: 32.0605369, longitude: 34.7738957},
                {latitude: 32.0606141, longitude: 34.7707790},
                {latitude: 32.0671196, longitude: 34.7626948},
            ],
        },
    ],
    minimumEntranceDate: parseIsraelDate('15/08/2017'),
    apartment: {
        cat: 2,
        subcat: 2,
        fromPrice: 4500,
        toPrice: 6500,
        city: 1800,
        fromRooms: 2,
        toRooms: 3.5,
        fromSquareMeter: 50,
        toSquareMeter: 85,

        // Only add the filters you actually need. 0 = false, 1 = true, commented out = whatever
        // parking: 1,
        // elevator: 1,
        airConditioner: 1,
        // bars: 1,
        // shelter: 1,
        // renovated: 1,
        // balcony: 1,
        // sunProch: 1,
        // warhouse: 1,
        // accessibility: 1,
        // Immediate: 1,
        // furniture: 1,
        // pandorDoors: 1,
        // pets: 1,
        // forPartners: 1,
        // longTerm: 1,
        // priceOnly: 1,
        imgOnly: 1,
    },
};
