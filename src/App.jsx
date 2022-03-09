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


const center = [51.505, -0.09]

const polyline = [
  [51.505, -0.09],
  [51.51, -0.1],
  [51.51, -0.12],
]


const multiPolyline = [
  [
    [51.5, -0.1],
    [51.5, -0.12],
    [51.52, -0.12],
  ],
  [
    [51.5, -0.05],
    [51.5, -0.06],
    [51.52, -0.06],
  ],
]

const polygon = [
  [51.515, -0.09],
  [51.52, -0.1],
  [51.52, -0.12],
]

const multiPolygon = [
  [
    [51.51, -0.12],
    [51.51, -0.13],
    [51.53, -0.13],
  ],
  [
    [51.51, -0.05],
    [51.51, -0.07],
    [51.53, -0.07],
  ],
]

const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06],
]

const fillBlueOptions = { fillColor: 'blue' }
const blackOptions = { color: 'black' }
const limeOptions = { color: 'lime' }
const purpleOptions = { color: 'purple' }
const redOptions = { color: 'red' }
const myOptions = { color: 'white' }


const meu = [
  [51.505, -0.09],
  [51.51, -0.12],
]

function App() {
  return (
    <MapContainer center={center} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle center={center} pathOptions={fillBlueOptions} radius={200} />
      <CircleMarker
        center={[51.51, -0.12]}
        pathOptions={redOptions}
        radius={20}>
        <Popup>Popup in CircleMarker</Popup>
      </CircleMarker>
      <Polyline pathOptions={limeOptions} positions={polyline} />
      <Polyline pathOptions={limeOptions} positions={multiPolyline} />
      <Polygon pathOptions={purpleOptions} positions={polygon} />
      <Polygon pathOptions={purpleOptions} positions={multiPolygon} />
      <Rectangle bounds={rectangle} pathOptions={blackOptions} />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          Oh no 1 <br /> Easily customizable.
        </Popup>
      </Marker>
      <Polyline pathOptions={myOptions} positions={meu} />
      <Marker position={[51.51, -0.12]}>
        <Popup>
          Oh no 2. <br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={[51.51, -0.1]}>
        <Popup>
        Hello 1 <br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={[51.52, -0.12]}>
        <Popup>
        Hello 2 <br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={[51.5, -0.12]}>
        <Popup>
          Hello 3<br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={[51.5, -0.06]}>
        <Popup>
        Hello 4 <br /> Easily customizable.
        </Popup>
      </Marker>
      <Marker position={[51.5, -0.05]}>
        <Popup>
        Hello 5 <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default App;
