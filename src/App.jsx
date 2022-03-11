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
  TileLayer,
  Marker,
} from 'react-leaflet'

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

  render(){
    return (
      <MapContainer center={center} zoom={18}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        <Marker position={Place1}>
          <Popup>
            Place 1 <br /> Easily customizable.
          </Popup>
        </Marker>
        <Polyline pathOptions={blackOptions} positions={myPolyline} />
        <Marker position={Place2}>
          <Popup>
            Place 2. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    );
  }
}

