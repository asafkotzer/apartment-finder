module.exports = {
  //use https://www.doogal.co.uk/polylines.php
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
  minimumPublishDate: new Date('7/04/2017'),
  apartment: {
    fromPrice: 4000,
    toPrice: 6000,
    area: 1,     // 1:TA, 2:center, 3:Ramat-Gan-Givatatyim, 48:TA center, 19:HaSharon
    subcat: 2,   //buy=1,rent=2, tivuc rent=6
    fromRooms: 3,
    toRooms: 4.5,
    imgOnly: 1,
    priceOnly: 1
    //HomeTypeID: 6, //for multi types use appartmentTypes. otherwise: 1-apartment,3-garden apt, 6-penthaus or roof, 4-studio or loft, 7-duplex, 51- triplex,5- prati or cottege,11-yehidat diur , 33-migrash, 39-du mishpahti, 45-storage house.
    //fromSquareMeter: 70
    //toSquareMeter: 100,
    
    //parking: 1,
    //elevator: 1,
    //airConditioner: 1,
    //renovated: 1,
    //balcony: 1,
    //sunProch: 1,
    //warhouse: 1,
    //furniture: 1,
    //forPartners: 1,
    //furniture: 1,
    //accessibility: 1,
    //bars: 1
  },
  appartmentTypes: ['דירת גן', 'דופלקס', 'גג/פנטהאוז', 'דירה'], //add exact names of wanted apartment type to filter

  //BEAWARE: scrape have not been tested with the latest version of yad2
  scrape: false             // this will get more details, but use it only if you don't have may apartments matching your query to avoid being blocked
}
