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
  useMapEvents,
  useMapEvent,
  TileLayer,
  Marker,
} from 'react-leaflet'

import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import ReactLeafletDriftMarker from "react-leaflet-drift-marker";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'leaflet/dist/leaflet.css';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const sharedMarkerProps = {
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  tooltipAnchor: [16, -28],
}

const vehicleMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  ...sharedMarkerProps,
  className: "movingVehicle"
});

const startedMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  ...sharedMarkerProps,
});

const targetMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  ...sharedMarkerProps,
});

const center = [-22.8066667, -43.2105167]

// Latitude --> 90 to -90
// Longitude --> 180 to -180
// Latitude --> (perto do zero) Norte/Sul (longe do zero), 
// Longitude --> (esquerda, valores longe do zero) Oeste/Leste (direita, valores perto do zero)
// const Place1 = [-22.8066, -43.2114]
// const Place2 = [-22.8066, -43.2105]
// const Place3 = [-22.8060, -43.2100]

const blackOptions = { color: 'black' }
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        vehicleMarkerPositionLatLng: {lat:-22.8066, lng: -43.2114},
        placesListIndex: 0,
        startedMarkerPoint: [-22.8066, -43.2114],
        placesMarkerList: [[-22.8066, -43.2114], [-22.8066, -43.2105], [-22.8060, -43.2100], [-22.8060, -43.2085]],
        mainPolyline: []
    }
  }

  componentDidMount() {
      console.log(this.state);
  }

  addMarker = (pointLat,pointLng) => {
      const newPlaceMarker = [pointLat,pointLng]
      this.setState((state)=> ({
        placesMarkerList: [...state.placesMarkerList,newPlaceMarker],
      }))
  }

  startPathHandler = () => {
    const { placesListIndex, placesMarkerList, mainPolyline } = this.state
    if(!mainPolyline.length) {
      toast.error("Click on 'Make Path'", {theme: "colored", autoClose: 2500})
      return 
    } 
    const target = placesMarkerList[placesListIndex]
    const targetLatlng = this.pointToLatlng(target) 
    this.setState((state)=> ({
      vehicleMarkerPositionLatLng: targetLatlng,
      placesListIndex: placesListIndex+1
    }))
  }

  continuePathHandler = ()=> {
    const { placesListIndex, placesMarkerList } = this.state
    if(placesListIndex >= placesMarkerList.length) return
    const target = placesMarkerList[placesListIndex]
    const targetLatlng = this.pointToLatlng(target) 
      this.setState((state)=> ({
        vehicleMarkerPositionLatLng: targetLatlng,
        placesListIndex: placesListIndex+1
    }))
  }
  
  makePolylinePath = ()=>{
    this.setState((state)=>({
        placesListIndex:0,
        mainPolyline: [state.startedMarkerPoint, ...state.placesMarkerList]
    }))
  }

  resetMap = ()=> {
    document.location.reload(true);
  }

  pointToLatlng = (point) => {
      return {
        lat: point[0], lng: point[1]
      }
  }

  latLangToPoint = (latLang) => {
      return [latLang.lat, latLang.lng]
  }

  render(){
    return (
      <>
        <ToastContainer />
        <MapContainer center={center} zoom={18}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline pathOptions={blackOptions} positions={this.state.mainPolyline} />
          <ReactLeafletDriftMarker
            position={this.state.vehicleMarkerPositionLatLng}
            duration={5000}
            eventHandlers={{
              click: () => {
                this.startPathHandler()
              },
              moveend: ()=>{
                this.continuePathHandler()
              }
            }}
            icon={vehicleMarker}
          >
            <Popup>
              Main Car<br />
            </Popup>
            <Tooltip>Car</Tooltip>
          </ReactLeafletDriftMarker>
          {/* <Marker position={Place2}>
            <Popup>
              Getting Fuel <br />
            </Popup>
            <Tooltip>Gas station</Tooltip>
          </Marker>
          <Marker position={Place3} icon={targetMarker}>
            <Popup>
              End Path.
            </Popup>
            <Tooltip>Main Stop</Tooltip>
          </Marker> */}
          {this.state.placesMarkerList.map((markerPosition, index, arr) =>{
            return (
              <Marker key={`key_${index}`} position={markerPosition} icon={index === 0 ? startedMarker : (index === arr.length-1 ? targetMarker : new L.Icon.Default())}>
                <Popup>
                  Place Marker Popup
                </Popup>
                <Tooltip>Tooltip of Marker</Tooltip>
              </Marker>
            )            
          })}
        </MapContainer>
        <button className="newMarker" onClick={()=> this.addMarker(-22.8056, -43.2105)}>Add Marker</button>
        <button className="primary" onClick={()=> this.makePolylinePath()}>Make Path</button>
        <button className="secondary" onClick={()=> this.startPathHandler()}>Begin Travel</button>
        <button className="reset" onClick={()=> this.resetMap()}>Reset Map</button>
      </>

    );
  }
}

