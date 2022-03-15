import React from 'react';
import L from 'leaflet';

import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Polygon,
  Popup,
  Rectangle,
  Tooltip,
  TileLayer,
  Marker,
} from 'react-leaflet'

import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import ReactLeafletDriftMarker from "react-leaflet-drift-marker";

import 'leaflet/dist/leaflet.css';
import './App.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const center = [-22.8066667, -43.2105167]

// Latitude --> 90 to -90
// Longitude --> 180 to -180
// Latitude --> (perto do zero) Norte/Sul (longe do zero), 
// Longitude --> (esquerda, valores longe do zero) Oeste/Leste (direita, valores perto do zero)
const Place1 = [-22.8066, -43.2114]
const Place2 = [-22.8066, -43.2105]


const myPolyline = [
  Place1,
  Place2,
]

const blackOptions = { color: 'black' }

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        latlng: {lat:-22.8066, lng: -43.2114}
    }
  }

  startPathHandler = (Place) => {
      this.setState((state)=> ({
          latlng: { lat: Place[0], lng: Place[1]},
      }))
  }

  render(){
    return (
      <>
        <MapContainer center={center} zoom={18}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline pathOptions={blackOptions} positions={myPolyline} />
          <ReactLeafletDriftMarker
            position={this.state.latlng}
            duration={5000}
            eventHandlers={{
              click: () => {
                this.startPathHandler(Place2)
              },
            }}
          >
            <Popup>
              A pretty CSS3 popup.<br /> Easily customizable.
            </Popup>
            <Tooltip>Tooltip for Marker</Tooltip>
          </ReactLeafletDriftMarker>
          <Marker position={Place2}>
            <Popup>
              Place 2. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
        <button onClick={()=> this.startPathHandler(Place2)}>Start</button>
      </>

    );
  }
}

