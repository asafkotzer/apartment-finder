module.exports = {
  searchArea: [
    {latitude: 32.078284, longitude: 34.801168},
    {latitude: 32.079157, longitude: 34.815073},
    {latitude: 32.068174, longitude: 34.814472},
    {latitude: 32.066501, longitude: 34.808636},
    {latitude: 32.063810, longitude: 34.796877},
    {latitude: 32.068538, longitude: 34.795761},
    {latitude: 32.071593, longitude: 34.797049},
    {latitude: 32.070865, longitude: 34.799881},
    {latitude: 32.076684, longitude: 34.802198},
  ],
  minimumPublishDate: new Date('8/15/2016'),
  apartment: {
    FromPrice: 1500000,
    ToPrice: 2500000,
    AreaID:2,     // 1:TA, 2:center, 3:Ramat-Gan-Givatatyim, 48:TA center, 19:HaSharon
    SubCatID:1,   // buy=1,rent=2
    FromRooms:3.5,
    ToRooms:4.5,
    FromSQM:90,
    ToSQM:125
  },
  scrape: true,             // this will get more details, but use it only if you don't have may apartments matching your query to avoid being blocked
  requiredTraits: ['חניה', 'מעלית'] // ['מיזוג', 'סורגים', 'חניה', 'מעלית', 'גישה לנכים',  'ממ"ד', 'מרפסת', 'מרפסת שמש', 'מחסן', 'משופצת', 'דלתות פנדור', 'יחידת דיור']
}
