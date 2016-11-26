import React, { Component } from 'react';
import { save, load } from './query-persistence.js';

export default class Query extends Component {
  constructor(props) {
    super(props);
    load().then(query => console.log(query));
  }
  render() {
    const { map } = this.props;
    console.log(map);

    const searchArea = [
      {lat: 32.078284, lng: 34.801168},
      {lat: 32.079157, lng: 34.815073},
      {lat: 32.068174, lng: 34.814472},
      {lat: 32.066501, lng: 34.808636},
      {lat: 32.063810, lng: 34.796877},
      {lat: 32.068538, lng: 34.795761},
      {lat: 32.071593, lng: 34.797049},
      {lat: 32.070865, lng: 34.799881},
      {lat: 32.076684, lng: 34.802198},
    ];

    const polygon = new google.maps.Polygon({
      paths: searchArea,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    
    polygon.setMap(map);

    return (
      <div className="four columns">Hello</div>
    );
  }
}