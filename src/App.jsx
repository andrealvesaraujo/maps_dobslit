import React, {useEffect} from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Polyline,
  Popup,
  Tooltip,
  TileLayer,
  Marker,
  useMap
} from 'react-leaflet'
// import { ToastContainer, toast } from 'react-toastify';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
// import ReactLeafletDriftMarker from "react-leaflet-drift-marker";

import 'leaflet-geosearch/dist/geosearch.css';
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

// const vehicleMarker = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
//   ...sharedMarkerProps,
//   className: "movingVehicle"
// });

const startedMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  ...sharedMarkerProps,
});

const targetMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

// const SearchStartMarker = () => {
//   const provider = new OpenStreetMapProvider ();

//   // @ts-ignore
//   const searchControl = new GeoSearchControl({
//     searchLabel: 'Starting Address',
//     notFoundMessage: 'Sorry, that address could not be found.',
//     marker: {
//       icon: startedMarker
//     },
//     provider: provider,
//     style: 'bar',
//   });

//   const map = useMap();
//   useEffect(() => {
//     map.addControl(searchControl);
//     return () => map.removeControl(searchControl);
//   }, []);

//   return null;
// };

const SearchNewMarker = ({handlerAddMarker}) => {
  const provider = new OpenStreetMapProvider (
    {
      params: {
        addressdetails: 1,
      },
    }
  );

  // @ts-ignore
  const searchControl = new GeoSearchControl({
    searchLabel: 'New Address',
    autoComplete: true,
    autoClose: true,
    keepResult: false,
    notFoundMessage: 'Sorry, that address could not be found.',
    resultFormat: ({ result }) => {
      return result.label
    }, 
    provider: provider,
    style: 'bar',
  });
  
  const map = useMap();

  map.on('geosearch/showlocation', ((searchResult)=> {
    const valueLatitude = searchResult.location.raw.lat
    const valueLongitude = searchResult.location.raw.lon
    const address = searchResult.location.raw.address
    if(valueLatitude && valueLongitude){
      handlerAddMarker(valueLatitude, valueLongitude, address)
    }
  }));


  useEffect(() => {
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, []);

  return null;
};

const mainPathLineOptions = { color: 'black' }
let valor = 1
export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        // vehicleMarkerPositionLatLng: {lat:-22.8066, lng: -43.2114},
        // placesListIndex: 0,
        // startedMarkerPoint: [],
        placesMarkerList: [],
        mainPolyline: []
    }
  }
  componentDidMount() {
      // console.log(this.state.placesMarkerList);
  }

  addMarker = (pointLat,pointLng, address) => {
      let newPlaceMarker = [pointLat,pointLng]
      const hasMarkerInList = this.state.placesMarkerList.some((marker)=>{
          return marker.position[0] === newPlaceMarker[0] && marker.position[1] === newPlaceMarker[1]
      })
      
      if(hasMarkerInList){
        return
      }
      this.setState((state)=> ({
        placesMarkerList: [
          ...state.placesMarkerList,
          {
            position: newPlaceMarker,
            address
          }
        ],
      }))
  }

  // startPathHandler = () => {
  //   const { placesListIndex, placesMarkerList, mainPolyline } = this.state
  //   if(!mainPolyline.length) {
  //     toast.error("Click on 'Make Path'", {theme: "colored", autoClose: 2500})
  //     return 
  //   }
  //   let index = placesListIndex
  //   if(placesListIndex===0){
  //     index=1
  //   }
  //   const target = placesMarkerList[index]
  //   const targetLatlng = this.pointToLatlng(target) 
  //   this.setState((state)=> ({
  //     vehicleMarkerPositionLatLng: targetLatlng,
  //     placesListIndex: index+1
  //   }))
  // }

  // continuePathHandler = ()=> {
  //   const { placesListIndex, placesMarkerList } = this.state
  //   if(placesListIndex >= placesMarkerList.length) return
  //   const target = placesMarkerList[placesListIndex]
  //   const targetLatlng = this.pointToLatlng(target) 
  //     this.setState((state)=> ({
  //       vehicleMarkerPositionLatLng: targetLatlng,
  //       placesListIndex: placesListIndex+1
  //   }))
  // }
  
  makePolylinePath = ()=>{
    this.setState((state)=>({
        mainPolyline: [...state.placesMarkerList.map(marker=> marker.position)]
    }))
  }

  resetMap = ()=> {
    document.location.reload(true);
  }

  // pointToLatlng = (point) => {
  //     return {
  //       lat: point[0], lng: point[1]
  //     }
  // }

  // latLangToPoint = (latLang) => {
  //     return [latLang.lat, latLang.lng]
  // }

  render(){
    return (
      <>
        {/* <ToastContainer /> */}
        <MapContainer center={center} zoom={18}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://dobslit.com/">Dobslit</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* <SearchStartMarker /> */}
          <SearchNewMarker handlerAddMarker={this.addMarker}/>
          <Polyline pathOptions={mainPathLineOptions} positions={this.state.mainPolyline} />
          {/* <ReactLeafletDriftMarker
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
          </ReactLeafletDriftMarker> */}
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
          {this.state.placesMarkerList.map((marker, index, arr) =>{
            return (
              <Marker key={`key_${index}`} position={marker.position} icon={index === 0 ? startedMarker : (index === arr.length-1 ? targetMarker : new L.Icon.Default())}>
                <Popup>
                {marker.address.country} - {marker.address.city} - {marker.address.road} - {marker.address.house_number}
                </Popup>
                <Tooltip>Tooltip of Marker</Tooltip>
              </Marker>
            )            
          })}
        </MapContainer>
        {/* <button className="newMarker" onClick={()=> this.addMarker(this.state.placesMarkerList[this.state.placesMarkerList.length-1][0], this.state.placesMarkerList[this.state.placesMarkerList.length-1][1])}>Add Marker</button> */}
        <button className="primary" onClick={()=> this.makePolylinePath()}>Make Path</button>
        {/* <button className="secondary" onClick={()=> this.startPathHandler()}>Begin Travel</button> */}
        <button className="resetMap" onClick={()=> this.resetMap()}>Reset Map</button>
      </>

    );
  }
}

